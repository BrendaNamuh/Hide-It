
/*Define stylesheet */
const link = document.createElement('link');
link.rel = 'stylesheet';
//link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
document.head.appendChild(link);

//References
var button = {'like':{'right':'8%','icon':'fa-smile-o'},'dislike':{'right':'2%','icon':'fa-frown-o'}}

window.addEventListener('load', function() {
    
    // Executed on page load
    console.log('Extracting Posts ..')
    var data = get_posts()
    console.log('Processing Posts..')
    var triggering_posts = feed_data(data);
    
    window.addEventListener('scroll', function() {
      

        var scrollPosition = window.innerHeight + window.pageYOffset;
        var documentHeight = document.documentElement.offsetHeight;

        // Check if the user has reached the bottom of the page
        if (scrollPosition >= documentHeight) {
          console.log('Extracting Posts ..')
          data = get_posts();
          console.log('Processing Posts')
          feed_data(data);
        }

    });
});

// scrape reddit posts from user feed
function get_posts() {
    var data = []
   
    //const loaded_posts = document.querySelectorAll('div[data-testid="post-container"]');
    
    //const feed = document.querySelector('shreddit-feed');
    //'w-full m-0'
  //   console.log(feed)
  //   const posts_in_feed = feed.children;
  //   console.log('Children')
  //   let children = Array.from(posts_in_feed)
  //   children.forEach(child => {
  //     console.log(child.tagName); // Logs each child's tag name individually
  // });
    //console.log(articlesArray)
    // console.log(posts_in_feed)
    // const posts = Array.from(posts_in_feed);
    // console.log(posts);

    // Get the <body> element
    //const body = document.body;
    let feed = document.querySelector('shreddit-feed');
    
    console.log('Feed: ')
    console.log(feed)
    loaded_posts = feed.querySelectorAll('ARTICLE')
    


    loaded_posts.forEach(postElement => {
      // let option_bar = '';
      // try {
      //     option_bar = postElement.querySelector('._1ixsU4oQRnNfZ91jhBU74y')
      //         .querySelector('._3-miAEojrCvx_4FQ8x3P-s')
      //         .querySelector('._21pmAV9gWG6F_UKVe7YIE0');
      // } catch (error) {
      //     // Handle the error by using the alternative query
      //     option_bar = postElement.querySelector('._3-miAEojrCvx_4FQ8x3P-s')
      //         .querySelector('._21pmAV9gWG6F_UKVe7YIE0');
      // }
      // option_bar.appendChild(createButton('dislike'));
  
      // Get title
      let title = postElement.getAttribute('aria-label');
      console.log(title)
      // let post = postElement.getElementsByTagName('h3')[0].innerHTML;
      // // Get text if the post has it
      // let paragraphs = postElement.getElementsByTagName('p');
      
      // Array.from(paragraphs).forEach(paragraph => {
      //     // Don't include text about why user is seeing the post
      //     const dont_include = [
      //         "Popular near you", "Suggested", "Promoted", 
      //         "Because you visited this community before",
      //         "Popular on Reddit right now", "Videos that redditors liked",
      //         "Some redditors find this funny", 
      //         "Because you've shown interest in a similar community"
      //     ];
          
      //     if (!dont_include.includes(paragraph.innerHTML)) {
      //         let clean_post = removeHtmlTags(paragraph.innerHTML);
      //         post = post.concat(" ", clean_post);
      //     }
      // });
  
      data.push(title);
  });
    

    return data
  }

// send user posts to model in server api, get back label for each post
function feed_data(data) {
  //Selects all div elements in the DOM with the attribute data-click-id equal to background.
    var loaded_posts = document.querySelectorAll("article");
    
    
    // access user preferences
    //Uses the Chrome Extensions API to retrieve the user’s saved preferences from chrome.storage.sync
    chrome.storage.sync.get('triggers').then(trigger_response => {
      triggers = trigger_response.triggers
      chrome.storage.sync.get('threshold').then(threshold_response => {
          threshold = threshold_response.threshold
          user_prefs = {'triggers':triggers, 'threshold':threshold, "data":data}
                console.log('Selected triggers: ',triggers)

                //Send a POST request to the Python server
                //A fetch call is made to send a POST request to the Flask backend at the specified URL
                //'http://127.0.0.1:5000/api/data'
                //result = fetch('http://localhost:5000/api/submit', {
                result =  fetch('http://127.0.0.1:5000/api/submit', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                    },
                    mode: 'cors',
                    body: JSON.stringify(user_prefs)
                })
            
                    // Processes the response from the server, 
                    //Converting it from JSON format to a JavaScript object.
                    .then(response => response.json())
                    .then(result => {
                    // Process the response from the Python server
                    // put response into dict
                    //labelled_posts = [];
                    
                    labelled_posts = {};
                    for (const key in result) {
                        labelled_posts[`${key}`] = `${result[key]}`
                        
                    }
                    // hide posts on user end
                    console.log('Labelled Posts:')
                    console.log(labelled_posts)
                    // for (const [key, value] of Object.entries(labelled_posts)) {
                    //   hidePost(loaded_posts[key]);
                    // }
                    //console.log(loaded_posts[0])
                    hidePost(loaded_posts[0])
                    // hidePost(loaded_posts[1])
                    // loaded_posts.forEach(post =>{
                    //   console.log(post)
                    //   hidePost(post)
                    // })
                    
                    })
                    .catch(error => {
                    console.error('Error:', error);
                    });
                return result
        })
    })
}



// clean posts
function removeHtmlTags(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const cleanedText = doc.body.textContent;
    return cleanedText;
}

  function hidePost(post) {
    //post.style.filter = 'blur(10px)';
    
    // Extract width, and height of post to hide
    let width = post.getBoundingClientRect().width;
    let height = post.getBoundingClientRect().height

    // Create cover element
    var cover = document.createElement("div");
    // Style cover element
    cover.style.position = "absolute";
    cover.style.border = '2px solid red';
    cover.style.background = 'white';
    cover.style.width = width +'px' ;
    cover.style.height = height+'px';
    cover.style.zIndex = '1' ;
    //cover.style.filter = 'blur(5px)';
    //cover.background ='rgba(247, 247, 255, 0.88)'
    cover.style.top = post.offsetTop +'px' ;
    cover.style.left = post.offsetLeft +'px' ;

    // Set the background image using the correct URL
    //cover.style.backgroundImage = 'url(http://127.0.0.1:5000/static/popup.png)'; // Update to your Flask static URL
    //cover.style.backgroundImage = 'url(https://raw.githubusercontent.com/BrendaNamuh/Hide-It/main/chrome-ext/popup.png)';
    cover.style.backgroundImage = 'url(../popup.png)';
    cover.style.backgroundSize = 'contain'; // Scale the image to fit
    cover.style.backgroundRepeat = 'no-repeat'; // Prevent repeating
    cover.style.backgroundPosition = 'center'; // Center the image
    // Add unhide button to cover
    //cover.appendChild(getUnhideButton(cover));

    // Add cover to post 
    post.appendChild(cover)
     
  }
  // Returns unhide button to div
  function getUnhideButton(div){
    // Create a text element
    var unhideButton = document.createElement("button");
    unhideButton.style.background = 'transparent'

    // Set the text content
    unhideButton.innerHTML = "See post";
    
    // Apply initial styles
    unhideButton.style.color = "white";
    unhideButton.style.position = "absolute"
    unhideButton.style.width = "100%";
    unhideButton.style.height = "25%";
    unhideButton.style.bottom = '0px';
    unhideButton.style.fontSize = "18px";

    // Create line on cover
    line = document.createElement('div')
    line.style.width ='65%'
    line.style.height = '1px'
    line.style.background='white'
    line.style.position = 'absolute'
    line.style.top = '10%'
    //Center horizontally
    line.style.left = '50%';
    line.style.transform = 'translateX(-50%)';
    unhideButton.appendChild(line)

    // Add event listener for click event
    unhideButton.addEventListener("click", function() {  
      div.remove();
    });

    // Add event listener for hover effect
    // unhideButton.addEventListener("mouseover", function() {
    //   // Mouse hover effect: fade to black
    //   unhideButton.style.color = "black";
    // });

    // unhideButton.addEventListener("mouseout", function() {
    //   // Mouse hover effect: revert back to gray
    //   unhideButton.style.color = "gray";
    // });
    return unhideButton
    

  }

function getIcon(icon_name){
  var icon = this.document.createElement('i');
  icon.classList.add('fa', icon_name);
  icon.setAttribute('width','22px');
  icon.setAttribute('height', '22px');
  icon.style.fontSize = '23px';
  return icon
}

function createButton(type){

  var btn = document.createElement('button')
  //Style button
  btn.style.position = "absolute";
  btn.style.width = '30px'
  btn.style.height = '30px'
  btn.style.right = button[type]['right'];
  btn.style.bottom = '1.5%';
  btn.addEventListener('click',function(){
    console.log("Button " +btn+ " has been clicked")
  });
  //Add icon
  btn.appendChild(getIcon(button[type]['icon']))

  return btn
}






