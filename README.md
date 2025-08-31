## Inline Api Mocker
- `npm run dev` to develop with hot reloading
- `npm run build` to create script
- `npm run preview` after build to use test page to check the build works

This mocker is a single JS file that can be added to a site to enable the ability to define mocked responses to api calls made by an app. 
This is to help with development and testing.

### Usage
- Run `npm run build` and copy the `dist/mocker.js` into your app and include it into your site EG `<script type="module" crossorigin src="/mocker.js"></script>`
- Load the page with `debug-mocker=true` query param to enable the functionality. 
- Click the new button in the top right (if your site has stuff with massive z indexs it could be under them not much i can do i gave it a big number)
- This will display a full screen modal over the top of your app with a form to create, edit, import, export and delete mocked api responses from calls made by your app
- The log at the bottom logs api calls made to help you make mocks that match


### Notes
- The app works by overriding and intercepting windows.fetch so if your code or libraries you are using do this themselves or use another way to make http calls it wont work.
- If a mock is not matched it will fallback to making a proper request.
- This is a bit of a POC theres still things that could be improve
  - Better capabilities for matching requests EG query params
  - More testing and potentially work on how to support non-text request bodies (probably just ignore the mocker if the body isnt text). This is made for JSON


