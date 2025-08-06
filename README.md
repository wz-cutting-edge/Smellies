# Web Development Final Project - *SMELLIES*

Submitted by: **William Zheng**

This web app: **Smellies is the online hangout for people who smell... really good. It’s a fragrance forum where scent-obsessed folks share their blind buy wins (and horror stories), drop layering combos that go hard, and beg the community for cheaper dupes of $500 niche unicorns. Got a new cologne that smells like regret? Ask if it just needs to macerate. Found a hidden gem at Marshalls? Flex it. Smellies is where you come to laugh, cry, overthink your next purchase, and bond with other good-smelling weirdos who understand the thrill of cracking open a fresh bottle and asking the real questions: "Does this slap?"**

Time spent: **30** hours spent in total

## Required Features

The following **required** functionality is completed:


- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add: 
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title 
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    -  creation time
    -  upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page. 
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:


- [x] Web app implements pseudo-authentication
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [ ] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [x] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [ ] Users can add more characterics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [ ] Web app displays a loading animation whenever data is being fetched

The following **additional** features are implemented:

* [x] Supabase auth, upvote/downvote system (on posts and comments)

## Video Walkthrough

Here's a walkthrough of implemented user stories:



GIF created with [ScreenToGif](https://www.screentogif.com/) for Windows

## Notes

I encountered significant challenges when configuring Supabase policies to distinguish between posters and viewers. Styling the application was also difficult; I had to use inline styles because standard CSS was not applying as expected. Implementing tags and categories proved to be more complex than anticipated, and I was unable to complete that feature in time. Although several planned features were not realized, I was able to finish all required functionality, albeit very close to the deadline. I plan to revisit and improve these areas in the future. This project was a nightmare to debug because of all of the moving parts.

## License

    Copyright [2025] [William Zheng]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.