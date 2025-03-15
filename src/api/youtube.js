const CHANNEL_ID = import.meta.env.VITE_CHANNEL_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

export async function getUploadsPlaylist() {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if ("error" in data) {
        console.log("YouTube API Error : " + data["error"]["message"])
        return null;
    }

    if (data.items.length > 0) {
        return data.items[0].contentDetails.relatedPlaylists.uploads;
    }

    return null;
}

export async function getAllVideos(pageToken = '') {
    const playlistId = await getUploadsPlaylist();
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    let videos = data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId
    }));

    if (data.nextPageToken) {
        videos = videos.concat(await getAllVideos(data.nextPageToken));
    }

    return videos;
}

export async function getMostRecentVideo() {
    const playlistId = await getUploadsPlaylist();
    const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosData.items || videosData.items.length === 0) {
        throw new Error("No videos found.");
    }

    const latestVideo = videosData.items[0].snippet;
    return {
        title: latestVideo.title,
        videoId: latestVideo.resourceId.videoId,
        thumbnail: latestVideo.thumbnails.high.url,
        publishedAt: latestVideo.publishedAt
    };
}