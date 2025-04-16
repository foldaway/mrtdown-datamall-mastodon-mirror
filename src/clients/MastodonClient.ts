interface StatusPostResponse {
  id: string;
}

export class MastodonClient {
  private hostname: string;
  private accessToken: string;

  constructor(hostname: string, accessToken: string) {
    this.hostname = hostname;
    this.accessToken = accessToken;
  }

  async statusPost(text: string): Promise<StatusPostResponse> {
    const formData = new FormData();
    formData.set('status', text);

    const url = new URL('/api/v1/statuses', `https://${this.hostname}`);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      method: 'POST',
      body: formData,
    });

    return await res.json();
  }
}
