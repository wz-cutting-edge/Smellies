/*shows the full post with image, text, title, upvotes, downvotes, creation time, user that posted, and comments under the post, allows any user to comment under the post on this page, you can only upvote or downvote on this page and no where else, you can upvote or downvote any number or times, show an alert to the user if not signed in trying to comment, post, upvote, downvote, if you are the posting user then you will see an edit button and a delete button*/
import { supabase } from '../client.js';

const DetailedPost = () =>{
    async function handleAddComment(postId, commentText, user) {
    const { data, error } = await supabase.from('comments').insert([
        {
        post_id: postId,
        content: commentText,
        user_id: user.id,
        },
    ]);
    }
    return(
        <div>

        </div>
    )
}

export default DetailedPost