import axios from 'axios';

// Facebook Post Metadata Types
export interface DescriptionTag {
    id: string;
    length: number;
    name: string;
    offset: number;
    type: string;
}

export interface MediaImage {
    height: number;
    src: string;
    width: number;
}

export interface AttachmentMedia {
    image: MediaImage;
}

export interface AttachmentTarget {
    id: string;
    url: string;
}

export interface PostAttachment {
    description: string;
    description_tags: DescriptionTag[];
    media: AttachmentMedia;
    target: AttachmentTarget;
    type: string;
    url: string;
}

export interface PostAttachments {
    data: PostAttachment[];
}

export interface FacebookPostMetadata {
    message: string;
    permalink_url: string;
    created_time: string;
    attachments: PostAttachments;
    id: string;
}

// Score API Types
export interface PostScore {
    postId: string;
    score: number;
    details?: any;
}

export interface ContentData {
    content: {
        caption: string;
        hashtags: string[];
        image_urls: string[];
    };
    topic: string;
}

// Env passed by choreo
const serviceURL = process.env.CHOREO_SCOREAPI_SERVICEURL;
const choreoApiKey = process.env.CHOREO_SCOREAPI_CHOREOAPIKEY;

// Shared API client
let apiClient: any = null

// Initialize API client
const getApiClient = () => {
    if (!apiClient) {
        apiClient = axios.create({
            baseURL: serviceURL,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'Choreo-API-Key': choreoApiKey
            }
        })
    }
    return apiClient
}

// Helper function to extract hashtags from message
const extractHashtags = (message: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    const matches = message.match(hashtagRegex);
    return matches || [];
}

// Helper function to extract image URLs from attachments
const extractImageUrls = (attachments: PostAttachments): string[] => {
    const imageUrls: string[] = [];

    if (attachments?.data) {
        attachments.data.forEach(attachment => {
            if (attachment.media?.image?.src) {
                imageUrls.push(attachment.media.image.src);
            }
        });
    }

    return imageUrls;
}

// Helper function to determine topic from message (simple keyword-based approach)
const extractTopic = (message: string): string => {
    // Simple topic extraction - you might want to enhance this with more sophisticated logic
    const lowerMessage = message.toLowerCase();

    // Define topic keywords (extend as needed)
    const topicKeywords = {
        'raincoat': ['raincoat', 'rain gear', 'waterproof'],
        'fashion': ['style', 'outfit', 'fashion', 'clothing'],
        'kids': ['kids', 'children', 'child'],
        'weather': ['weather', 'sunny', 'rainy', 'cloudy'],
        'outdoor': ['outdoor', 'hiking', 'camping', 'adventure']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return topic;
        }
    }

    return 'general'; // default topic
}

// Function to map FacebookPostMetadata to ContentData
export const mapFacebookPostToContentData = (post: FacebookPostMetadata): ContentData => {
    const hashtags = extractHashtags(post.message);
    const imageUrls = extractImageUrls(post.attachments);

    // Remove hashtags from message to get clean caption
    const caption = post.message.replace(/#[\w]+/g, '').trim();

    return {
        content: {
            caption,
            hashtags,
            image_urls: imageUrls
        },
        topic: "raincoat"
    };
}


export const getScoreForPosts = async (posts: FacebookPostMetadata[]): Promise<PostScore[]> => {
    try {
        const client = getApiClient();
        const results: PostScore[] = [];

        // Iterate through each post and get its score
        for (const post of posts) {
            try {
                // Convert Facebook post to ContentData format
                // @ts-ignore
                const contentData = mapFacebookPostToContentData(post.metadata);

                // Send individual post for scoring
                const response = await client.post('analyze', contentData);

                // Collect response with post ID
                results.push({
                    postId: post.id,
                    score: response.data.score,
                    details: response.data.details
                });

            } catch (postError) {
                console.error(`Error scoring post ${post.id}:`, postError);
                // Add failed post with default score
                results.push({
                    postId: post.id,
                    score: 0,
                    details: { error: 'Failed to score post' }
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Error fetching scores for posts:', error);
        throw error;
    }
}