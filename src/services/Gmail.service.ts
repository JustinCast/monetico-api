import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { gmail_v1, google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import { flatten, filter } from 'lodash';
import { JSDOM } from 'jsdom';

const client = new OAuth2Client();

const gmail = google.gmail('v1');

// FIXME: move this code
const YOUR_CLIENT_ID =
  '678054942691-6qn4u4d6e6j3sivgvhhhvofe8gtbb8n3.apps.googleusercontent.com'; // FIXME: search for a way to correctly save this

const YOUR_CLIENT_SECRET = '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';
const BAC = 'notificacion@notificacionesbaccr.com';
const BN = 'bncontacto@bncr.fi.cr';

type ProcessingParams = {
  parts: gmail_v1.Schema$MessagePart[];
  id: string;
  bank: string;
};
//
@Injectable()
export class GmailService {
  constructor(private readonly httpService: HttpService) {}

  signUp(code: string) {
    const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${YOUR_CLIENT_ID}&client_secret=${YOUR_CLIENT_SECRET}&redirect_uri=http://localhost:5173/hame&grant_type=authorization_code`;

    this.httpService.get(url).subscribe(({ id_token }: any) => {
      console.log(id_token);
    });
  }

  // BN: bncontacto@bncr.fi.cr
  // BAC: notificacion@notificacionesbaccr.com
  private async getMessages(bank: string) {
    return new Promise(async (resolve) => {
      const {
        data: { messages },
      } = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${bank}`,
      });

      resolve({
        bank,
        messages,
      });
    });
    // const { messages } = data;

    // return messages;
  }

  async readEmails(token: string, banks: Array<string>) {
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

    const bankPromises = banks.map((b: string) => this.getMessages(b));

    const responses = await Promise.allSettled(bankPromises);

    // if (messages) {
    //   const processed = await this.processEmails(messages);

    //   return processed;
    // }

    return Promise.allSettled(
      responses.map(async ({ status, value }: any) => {
        if (status === 'rejected')
          return { status, message: 'Error trying to retrieve email data' };

        const { bank, messages } = value;

        return this.processEmails(bank, messages || []);
      }),
    );
  }

  processHtmlContent({ parts, id, bank }: ProcessingParams) {
    return parts.map(({ body }) => {
      const parsedResult = Buffer.from(body.data, 'base64').toString('ascii');
      const dom = new JSDOM(parsedResult);
      const [, , , , table] = dom.window.document.getElementsByTagName('table');
      const rows = table.getElementsByTagName('tr');
      const [firstRow] = rows; // COMERCIO
      const lastRow = rows[rows.length - 1]; // MONTO
      const [, place] = firstRow.getElementsByTagName('td');
      const [, amount] = lastRow.getElementsByTagName('td');

      return {
        id,
        bank,
        total: String(amount.textContent).replaceAll('\n', ''),
        place: String(place.textContent).replaceAll('\n', ''),
      };
    });
  }

  processPlainContent({ parts, id, bank }: ProcessingParams) {
    return parts.map(({ body }) => {
      const parsedResult = Buffer.from(body.data, 'base64').toString('ascii');
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
        [matchedAmount, matchedPlace, matchedDate, matchedHour].includes(null)
      )
        return undefined;

      return {
        id,
        bank,
        total: matchedAmount[0],
        place: matchedPlace[1],
        date: matchedDate[1],
        hour: matchedHour[1],
      };
    });
  }

  async processEmails(bank: string, messages: Array<gmail_v1.Schema$Message>) {
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
        data: { snippet, payload, id },
      }: GaxiosResponse<gmail_v1.Schema$Message> = value;

      const containsReservedWords = reservedWords.some((w: string) =>
        snippet.toLowerCase().includes(w),
      );

      const htmlContent = payload.parts.filter(
        ({ mimeType }) => mimeType === 'text/html',
      );

      if (htmlContent && bank === BAC)
        return this.processHtmlContent({ parts: htmlContent, id, bank });

      if (containsReservedWords && bank === BN) {
        const textParts = payload.parts.filter(
          ({ mimeType }) => mimeType === 'text/plain',
        );

        return this.processPlainContent({ parts: textParts, id, bank });
      }
    });

    return filter(flatten(result as any), (v) => !!v);
  }
}
