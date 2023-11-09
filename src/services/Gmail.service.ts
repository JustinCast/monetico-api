import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

const YOUR_CLIENT_ID =
  '678054942691-6qn4u4d6e6j3sivgvhhhvofe8gtbb8n3.apps.googleusercontent.com'; // FIXME: search for a way to correctly save this

const YOUR_CLIENT_SECRET = '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';

@Injectable()
export class GmailService {
  constructor(private readonly httpService: HttpService) {}

  signUp(code: string) {
    const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${YOUR_CLIENT_ID}&client_secret=${YOUR_CLIENT_SECRET}&redirect_uri=http://localhost:3000/google&grant_type=authorization_code`;

    this.httpService.get(url).subscribe(({ id_token }: any) => {
      console.log(id_token);
    });
  }
}
