import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { gmail_v1, google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import { flatten, filter } from 'lodash';

const client = new OAuth2Client();

const gmail = google.gmail('v1');

const YOUR_CLIENT_ID =
  '678054942691-6qn4u4d6e6j3sivgvhhhvofe8gtbb8n3.apps.googleusercontent.com'; // FIXME: search for a way to correctly save this

const YOUR_CLIENT_SECRET = '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';

@Injectable()
export class GmailService {
  constructor(private readonly httpService: HttpService) {}

  signUp(code: string) {
    const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${YOUR_CLIENT_ID}&client_secret=${YOUR_CLIENT_SECRET}&redirect_uri=http://localhost:5173/hame&grant_type=authorization_code`;

    this.httpService.get(url).subscribe(({ id_token }: any) => {
      console.log(id_token);
    });
  }

  async readEmails(token: any) {
    await client.verifyIdToken({
      idToken: token,
      audience: YOUR_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const auth = await authenticate({
      keyfilePath:
        '/home/justincast/projects/monetico-api/src/services/keys.json',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    });

    google.options({ auth });

    const { data } = await gmail.users.messages.list({
      userId: 'me', // FIXME:
      q: `from:bncontacto@bncr.fi.cr`,
    });
    const { messages } = data;

    if (messages) {
      const processed = await this.processEmails(messages);

      return processed;
    }

    return [];
  }

  async processEmails(messages: Array<gmail_v1.Schema$Message>) {
    const reservedWords = ['comprobante', 'compra', 'monto'];
    // const items = [];

    const promises = messages.map(({ id }) => {
      return gmail.users.messages.get({
        userId: 'me',
        id,
      });
    });

    const responses = await Promise.allSettled(promises);

    const result = responses.map(({ status, value }: any) => {
      if (status === 'rejected')
        return { status, message: 'Error trying to retrieve email data' };

      const {
        data: { snippet, payload },
      }: GaxiosResponse<gmail_v1.Schema$Message> = value;

      const containsReservedWords = reservedWords.some((w: string) =>
        snippet.toLowerCase().includes(w),
      );

      if (containsReservedWords) {
        const textParts = payload.parts.filter(
          ({ mimeType }) => mimeType === 'text/plain',
        );

        return textParts.map(({ body }) => {
          const parsedResult = Buffer.from(body.data, 'base64').toString(
            'ascii',
          );
          const words = parsedResult;
          const matchPlace = /realizada en \*([^*]+)\*/;
          const matchDate = /el \*([^*]+)\*/;
          const matchHour = /las \*([^*]+)\*/;
          const matchAmount = /(?:CRC|USD) (\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/;

          const matchedAmount = words.match(matchAmount);
          const matchedPlace = words.match(matchPlace);
          const matchedDate = words.match(matchDate);
          const matchedHour = words.match(matchHour);

          if (
            [matchedAmount, matchedPlace, matchedDate, matchedHour].includes(
              null,
            )
          )
            return undefined;

          return {
            total: matchedAmount[0],
            place: matchedPlace[1],
            date: matchedDate[1],
            hour: matchedHour[1],
          };
        });
      }
    });

    return filter(flatten(result as any), (v) => !!v);
  }
}
