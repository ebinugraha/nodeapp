// Utility to simulate network latency
const simulateNetworkDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class YoutubeService {
  private apiKey: string;
  private baseUrl: string = "https://www.googleapis.com/youtube/v3";

  constructor(apiKey?: string) {
    // In a real app, this would come from environment variables
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || "mock-api-key";
  }

  public async fetchComment(type: string, videoId?: string): Promise<any> {
    console.log(`[YoutubeService] Preparing HTTP GET request to ${this.baseUrl}/commentThreads`);
    console.log(`[YoutubeService] Parameters: part=snippet, videoId=${videoId || 'mock_video_id'}, maxResults=100`);
    
    // Simulate API Network call latency
    await simulateNetworkDelay(800);

    try {
      // Simulate API Rate Limiting (1 in 20 chance to fail)
      if (Math.random() < 0.05) {
        throw new Error("HTTP 429: Too Many Requests. Quota exceeded.");
      }

      if (type === "invalid") {
        throw new Error("HTTP 400: Bad Request. Invalid filter type.");
      }

      console.log(`[YoutubeService] Successfully fetched comments. Parsing JSON response...`);
      
      // Mocked Google API Response structure
      const mockApiResponse = {
        kind: "youtube#commentThreadListResponse",
        etag: `"etag_${Math.random().toString(36).substring(7)}"`,
        nextPageToken: "pageToken123",
        pageInfo: {
          totalResults: 24,
          resultsPerPage: 20
        },
        items: [
          {
            kind: "youtube#commentThread",
            id: `Ugz${Math.random().toString(36).substring(7)}`,
            snippet: {
              videoId: videoId || "mock_video_id",
              topLevelComment: {
                snippet: {
                  authorDisplayName: "@User" + Math.floor(Math.random() * 10000),
                  textDisplay: "This is a brilliantly simulated comment retrieved from the API!",
                  likeCount: Math.floor(Math.random() * 500),
                  publishedAt: new Date().toISOString()
                }
              }
            }
          }
        ]
      };

      return { 
        status: "success", 
        data: mockApiResponse,
        metadata: {
          quotaUsed: 1,
          cached: false
        }
      };
    } catch (error: any) {
      console.error(`[YoutubeService] API call failed:`, error.message);
      return { 
        status: "error", 
        code: error.message.includes("429") ? 429 : 400,
        message: error.message 
      };
    }
  }

  public async youtubeResponse(): Promise<any> {
    await simulateNetworkDelay(200);
    return { 
      status: "youtube_api_success",
      connection: "healthy",
      pingMs: 120
    };
  }
}
