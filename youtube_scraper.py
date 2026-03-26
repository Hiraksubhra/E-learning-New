import yt_dlp

def get_youtube_details(url):
    """
    Extracts metadata from a YouTube video URL.
    """
    # Configure yt-dlp to extract info without downloading the video
    ydl_opts = {
        'quiet': True,          # Suppresses terminal output
        'skip_download': True,  # Ensures we only grab metadata
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract the video information
            info_dict = ydl.extract_info(url, download=False)
            
            # Parse out the specific details requested
            title = info_dict.get('title', 'Unknown Title')
            channel = info_dict.get('uploader', 'Unknown Channel')
            description = info_dict.get('description', 'No description available')
            duration_seconds = info_dict.get('duration', 0)

            # Format the duration from seconds into HH:MM:SS
            mins, secs = divmod(duration_seconds, 60)
            hours, mins = divmod(mins, 60)
            if hours > 0:
                duration_formatted = f"{hours}:{mins:02d}:{secs:02d}"
            else:
                duration_formatted = f"{mins:02d}:{secs:02d}"

            # Return as a dictionary
            return {
                "Title": title,
                "Channel": channel,
                "Duration": duration_formatted,
                "Description": description
            }

    except yt_dlp.utils.DownloadError:
        print("Error: Could not retrieve data. Please check if the URL is valid.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# --- Example Usage ---
if __name__ == "__main__":
    test_url = input("Enter a YouTube Video URL: ")
    
    video_details = get_youtube_details(test_url)
    
    if video_details:
        print("\n" + "="*40)
        print(f"**TITLE**: {video_details['Title']}")
        print(f"**CHANNEL**: {video_details['Channel']}")
        print(f"**DURATION**: {video_details['Duration']}")
        print("="*40)
        
        # Truncating the description to 300 characters so it doesn't flood your terminal
        desc = video_details['Description']
        print(f"**DESCRIPTION**:\n{desc[:300]}...\n")