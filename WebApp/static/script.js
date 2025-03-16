// api settings
var settings = {
    "url": "https://official-joke-api.appspot.com/random_joke",
    "method": "GET",
    "timeout": 0,
  };

function disableButton() {
  $("#loadJoke").prop('disabled', true);
  console.log("Button disabled");
}

function enableButton() {
  $("#loadJoke").prop('disabled', false);
  console.log("Button enabled");
}


// check if joke already in db
function checkForExistingJoke(setup, punchline) {
  let existingJoke;
  $.ajax({
    url: '/readJokes', // example json
    dataType: 'json',
    success: function(jokes) {
      existingJoke = jokes.find(j => j.text === (setup + " - " + punchline));
    },
    error: function(err) {
      console.error("Fehler beim Laden: ", err);
    }
  });
  return existingJoke;
}


// submit joke / add joke
$("#submitJokeRanking").click(function(){
  const ranking =  $("#starRating").attr("ranking");
  const setup = $("#jokeSetup").text();
  const punchline = $("#jokePunchline").text();
  if((typeof(ranking) != "undefined") && (punchline != "")) {
    console.log('submitted Ranking: ' + ranking);

    let existingJoke = checkForExistingJoke(setup, punchline);

    let submitJoke = [];

    if (existingJoke) {
      let ratingKey = `numOf${ranking}Stars`;
      existingJoke[ratingKey] = (parseInt(existingJoke[ratingKey]) || 0) + 1;
      submitJoke = existingJoke;
    } else {
      let newJoke = {
        "text": setup + ' - ' + punchline,
        "numOf1Stars": "0",
        "numOf2Stars": "0",
        "numOf3Stars": "0",
        "numOf4Stars": "0",
        "numOf5Stars": "0"
      };
      let ratingKey = `numOf${ranking}Stars`;
      newJoke[ratingKey] = "1";
      
      submitJoke = newJoke;
    }

    $.ajax({
      url: "/addJoke",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({submitJoke}),
      success: function (response) {
          alert(response.message);
      },
      error: function(err) {
        console.error("Fehler beim Laden: ", err);
      }
    });
  } else {
    console.log(ranking)
    console.log(punchline);
    alert("No Rating submitted, please wait for the punchline and rate the joke before submitting.")
  }
})


// star display
const stars = document.querySelectorAll('#starRating .star');
const ratingDisplay = document.getElementById('ratingDisplay');

stars.forEach(star => {
  star.addEventListener('click', () => {
    const rating = parseInt(star.getAttribute('data-value'));
    updateStars(rating);
    ratingDisplay.textContent = 'Chosen stars: ' + rating;
  });
});

function updateStars(rating) {
  stars.forEach(star => {
    const starValue = parseInt(star.getAttribute('data-value'));
    if (starValue <= rating) {
      // whole star
      star.classList.remove('bi-star');
      star.classList.add('bi-star-fill');
    } else { // outline star
      star.classList.remove('bi-star-fill');
      star.classList.add('bi-star');
    }
  });
  $("#starRating").attr("ranking", rating);
}


// create table when DOM is ready
$(document).ready(function() {
  const table = $('#jokesTable').DataTable({
    // pageLength: 10,
    order: [[2, 'desc']],
    paging: false,
    columnDefs: [
      {
        targets: 0,
        orderable: false,
        render: function(data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        }
      }
    ]
  });

  // ajax call for database (read)
  $.ajax({
    url: '/readJokes', // example json
    dataType: 'json',
    success: function(jokes) {
      jokes.forEach(function(joke) {
        // console.log(joke)
        if (!(Array.isArray(joke))) {
          // console.log("Objekt");
          var total = Number(joke.numOf1Stars) +
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
          console.log("Array");
          console.log(joke[0].count);
          $("#totalVotes").text(joke[0].count);
        }
      });
      table.draw();

      let realNumbers = 0;

      $('#jokesTable tbody tr').each(function(index) {
        $(this).find('td:first').text(index + 1); // Replace first column with row number
        $(this).text = realNumbers;
      });
    },
    error: function(err) {
      console.error("Fehler beim Laden: ", err);
    }
  });
  

  // get a new joke
  $("#loadJoke").click(function(){
    disableButton();
    console.log('clicked button');

    $.ajax(settings).done(function (response) {
      console.log(response);
      $("#jokeSetup").text(response.setup);
      
      setTimeout(function() {
        $("#jokePunchline").text(response.punchline);
        enableButton();
      }, 3000);
    });
  })
});
