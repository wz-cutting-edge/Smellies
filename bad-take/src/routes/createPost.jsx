/*write post, attach image (within file limit), or link url, has selectable tags (question, comment), (for men, for women, for unisex), (good blind, bad blind, layering, maceration, dupes), each of these categories you can only select one tag from */
import { supabase } from '../client.js';
import { useUser } from '../UserContext';

const CreatePost = () =>{
    const user = useUser();
    async function handleCreatePost(formValues, user) {
    const { title, content, imageUrl } = formValues;

    const { data, error } = await supabase.from('posts').insert([
        {
        title,
        content,
        image_url: imageUrl,
        user_id: user.id,
        },
    ]);
    }
    return(
        <div>

        </div>
    )
}
export default CreatePost

