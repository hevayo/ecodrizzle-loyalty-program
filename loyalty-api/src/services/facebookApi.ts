import axios from 'axios'
import { facebook } from '../config'

// Initialize axios client for Facebook Graph API
const facebookApi = axios.create({
    baseURL: 'https://graph.facebook.com/v19.0',
    timeout: 10000,
})

// Add page token to all requests
facebookApi.interceptors.request.use((config) => {
    if (config.params) {
        (config.params as any).access_token = facebook.pageToken
    } else {
        config.params = { access_token: facebook.pageToken }
    }
    return config
})

// Get user's posts from Facebook page
export const getUsersPostEligibleForPoints = async (pageId: string, userId: string) => {
    try {
        const response = await facebookApi.get(`/${pageId}/tagged`, {
            params: {
                access_token: facebook.pageToken,
            },
        })
        return extractPostAndUserIds(response, userId);
    } catch (error) {
        console.error('Error fetching Facebook tagged posts:', error)
        throw error
    }
}

// Extract post ID and user ID from Facebook response
export const extractPostAndUserIds = (
    response: any,
    userId: string
): Array<ExtractedPostData> => {
    const posts = response.data.data || []
    const extractedData = posts
        .filter((post: any) => {
            const postIdParts = post.id.split('_')
            return postIdParts[0] === userId // check if the post is tagged to the user
        })
        .map((post: any) => {
            const postIdParts = post.id.split('_')
            return {
                postId: post.id,
                userId: postIdParts[1],
                message: post.message,
                taggedTime: post.tagged_time
            }
        })
    return extractedData;
}

// Get post metadata from facebook graph api
export const getPostMetadata = async (posts: ExtractedPostData[]) => {
    try {
        const postMetadataPromises = posts.map(async (post) => {
            try {
                const response = await facebookApi.get(`/${post.postId}`, {
                    params: {
                        fields: 'message,permalink_url,created_time,from,attachments',
                        access_token: facebook.pageToken,
                    },
                })
                return {
                    postId: post.postId,
                    userId: post.userId,
                    metadata: response.data,
                    error: null
                }
            } catch (error) {
                console.error(`Error fetching metadata for post ${post.postId}:`, error)
                return null // Return null for failed requests
            }
        })

        const results = await Promise.allSettled(postMetadataPromises)

        // Filter out failed requests and return only successful ones
        return results
            .map((result, index) => {
                if (result.status === 'fulfilled' && result.value !== null) {
                    return result.value
                }
                return null
            })
            .filter((result): result is NonNullable<typeof result> => result !== null)
    } catch (error) {
        console.error('Error in getPostMetadata:', error)
        throw error
    }
}



export const getUsersPost = async (pageId: string, userId: string) => {

}


// Define an interface for the extracted post data
export interface ExtractedPostData {
    postId: string;
    userId: string;
    message: string;
    taggedTime: any;
}

// Define an interface for post metadata response
export interface PostMetadata {
    postId: string;
    userId: string;
    metadata: any;
}