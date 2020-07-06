<h1>Even the smallest application...</h1>
<p>...can change the course of the future.</p>
<p><a href="https://chuck-norris-jokes-save-world.herokuapp.com/" target="_blank">https://chuck-norris-jokes-save-world.herokuapp.com/</a></p>
<p>This is a small application that will provide a world-saving list of Chuck Norris jokes. When the time comes, the world will be lucky to have this app.</p>
<p>The app works in three steps:</p>
<ol>
    <li>Trigger the creation of a CSV file with Chuck Norris jokes (derived from the chucknorris-io API)</li>
    <li>Trigger the upload to AWS S3</li>
    <li>Download the provided CSV file and save the world</li>
</ol>
<h3>Words of caution:</h3>
<p>It is possible for the app to crash due to malformed JSON coming from the chucknorris-io API. In that case, please try again!</p>
<p>The final CSV file is best viewed with "|" as the separator and quotes set to "none".</p>
