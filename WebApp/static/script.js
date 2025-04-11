// api settings
const settings = {
    "url": "https://official-joke-api.appspot.com/random_joke",
    "method": "GET",
    "timeout": 0,
  };

// disable Loading button
function disableButton() {
  $("#loadJoke").prop("disabled", true);
}

// enable Loading button
function enableButton() {
  $("#loadJoke").prop("disabled", false);
}


// check if joke already in db
function checkForExistingJoke(setup, punchline) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/readJokes",
      dataType: "json",
      success: function (jokes) {
        const existingJoke = jokes.find(j => j.text === (setup + " - " + punchline));
        resolve(existingJoke);
      },
      error: function (err) {
        console.error("Error while loading: ", err);
        reject(err);
      },
    });
  });
}


// submit joke / add joke
$("#submitJokeRanking").click(function(){
  const ranking =  $("#starRating").attr("ranking");
  const setup = $("#jokeSetup").text();
  const punchline = $("#jokePunchline").text();
  
  try {
    if((typeof(ranking) != "undefined") && (punchline != "")) {
      console.log("Submitted Ranking: " + ranking);

      const existingJoke = checkForExistingJoke(setup, punchline);

      var submitJoke = [];

      // check if joke already exists
      if (existingJoke) {
        var ratingKey = "numOf${ranking}Stars";
        existingJoke[ratingKey] = (parseInt(existingJoke[ratingKey]) || 0) + 1;
        submitJoke = existingJoke;
      } else {
        // create new joke object
        const newJoke = {
          text: setup + " - " + punchline,
          numOf1Stars: "0",
          numOf2Stars: "0",
          numOf3Stars: "0",
          numOf4Stars: "0",
          numOf5Stars: "0"
        };
        const ratingKey = "numOf${ranking}Stars";
        newJoke[ratingKey] = "1";
        
        submitJoke = newJoke;
      }

      // addJoke route
      $.ajax({
        url: "/addJoke",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({submitJoke}),
        success: function (response) {
            alert(response.message);
        },
        error: function(err) {
          console.error("Error while loading: ", err);
        }
      });
    } else {
      alert("No Rating submitted, please wait for the punchline and rate the joke before submitting.")
    }
  } catch (err) {
    console.error("Error: ", err);
  }
})


// display stars
function updateStars(rating) {
  const stars = document.querySelectorAll("#starRating .star");
  stars.forEach(star => {
    const starValue = parseInt(star.getAttribute("data-value"));
    if (starValue <= rating) {  // whole star
      star.classList.remove("bi-star");
      star.classList.add("bi-star-fill");
    } else { // outline star
      star.classList.remove("bi-star-fill");
      star.classList.add("bi-star");
    }
  });
  $("#starRating").attr("ranking", rating);
  $("#ratingDisplay").text(`Chosen stars: ${rating}`);
}


document.querySelectorAll("#starRating .star").forEach(star => {
  star.addEventListener("click", () => {
    const rating = parseInt(star.getAttribute("data-value"));
    updateStars(rating);
  });
});


// create table when DOM is ready
$(document).ready(function() {
  const table = $("#jokesTable").DataTable({
    order: [[2, "desc"]],
    paging: false,
    columnDefs: [
      {
        targets: 0,
        orderable: false,
        render: function(_, __, ___, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      }
    ]
  });

  // ajax call for database (read)
  $.ajax({
    url: "/readJokes",
    dataType: "json",
    success: function(jokes) {
      jokes.forEach(function(joke) {
        if (!(Array.isArray(joke))) {
          const total = Number(joke.numOf1Stars) +
                      Number(joke.numOf2Stars) +
                      Number(joke.numOf3Stars) +
                      Number(joke.numOf4Stars) +
                      Number(joke.numOf5Stars);
                      
          var average = 0;
          average = average.toFixed(2);
          if (total > 0) {
            average = (1 * Number(joke.numOf1Stars) +
                      2 * Number(joke.numOf2Stars) +
                      3 * Number(joke.numOf3Stars) +
                      4 * Number(joke.numOf4Stars) +
                      5 * Number(joke.numOf5Stars)) / total;
          }

          table.row.add([
            "",
            joke.text,
            average
          ]);
        }
        else {
          $("#totalVotes").text(joke[0].count);
        }
      });
      table.draw();

      var realNumbers = 0;

      $("#jokesTable tbody tr").each(function(index) {
        // Replace first column with row number
        $(this).find("td:first").text(index + 1); 
        $(this).text = realNumbers;
      });
    },
    error: function(err) {
      console.error("Error while loading: ", err);
    }
  });
  

  // get a new joke
  $("#loadJoke").click(function(){
    disableButton();

    $.ajax(settings).done(function (response) {
      $("#jokeSetup").text(response.setup);
      setTimeout(function() {
        $("#jokePunchline").text(response.punchline);
        enableButton();
      }, 3000);
    });
  })
});
