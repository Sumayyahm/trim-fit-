// defining some global variables
var dayBlock = $(".Days")
var workoutModal = $("#scheduler-modal")
var inputArea = $("#textarea")
var modalSubmit = $("#submit-workout")
var closeBtn = $(".close-modal")
var modalText = $(".modal-text")
var workoutList = $(".workout-list")
var numberCheck = RegExp(/[0-9]/)

// Assigns proper date to each day of the week on scheduler
function renderDate() {
    for (i = 0; i < dayBlock.length; i++) {

        var blockToWrite = dayBlock[i]
        var dayTxt = blockToWrite.innerHTML
        var dayDt = moment(dayTxt, "dddd").format("L")
        var dateDisplay = $("<p>").addClass("day-date")
        dateDisplay.text(dayDt)

        blockToWrite.append(", " + dateDisplay.text())
    }
}

renderDate()

// creates workout button for each scheduled workout found in local storage and renders those buttons on correct row
function renderWorkouts() {
    for (k = 0; k < localStorage.length; k++) {

        var scheduledArray = localStorage.getItem(localStorage.key(k)).split(", ")

        for (w = 0; w < scheduledArray.length; w++) {

            var correctBlock = $("td:contains('" + localStorage.key(k) + "')")
            var storedWorkout = scheduledArray[w]
            var workoutBtn = $("<button>").addClass("workout-btn")
            workoutBtn.text(storedWorkout)
            correctBlock.next().append(workoutBtn)
        }
    }
}

renderWorkouts()

$(".dates-back").on("click", function () {

    for (b = 0; b < dayBlock.length; b++) {

        var blockToWrite = dayBlock[b]
        var dayDateTxt = blockToWrite.innerHTML
        var backDayDt = moment(dayDateTxt, "dddd, L").subtract("7", "days").format("dddd, L")

        blockToWrite.innerHTML = backDayDt
    }

    $(".workout-btn").remove()
    renderWorkouts()
})

$(".dates-forward").on("click", function () {

    for (b = 0; b < dayBlock.length; b++) {

        var blockToWrite = dayBlock[b]
        var dayDateTxt = blockToWrite.innerHTML
        var forwardDayDt = moment(dayDateTxt, "dddd, L").add("7", "days").format("dddd, L")

        blockToWrite.innerHTML = forwardDayDt
    }

    $(".workout-btn").remove()
    renderWorkouts()
})


// Workout button listener on scheduler that pulls up youtube videos
function workoutBtnEvent() {
    $(".workout-btn").on("click", function () {

        var buttonTxt = $(this).text()

        var youtubeAPI = "https://www.googleapis.com/youtube/v3/search"
        var apiKey = "AIzaSyAFvkpiXzwbO7dR0Nu3SG6_RcNQQT4fvJQ"

        function getYoutube() {
            $.ajax({
                url: youtubeAPI,
                type: "GET",
                data: {
                    key: apiKey,
                    q: buttonTxt,
                    maxResults: 3,
                    type: "video",
                    videoEmbeddable: true,
                    part: "snippet"
                },
                success: function (data) {
                    embedVideo(data)
                },
                error: function (response) {
                    console.log("Request Failed");
                }
            })
        }

        function embedVideo(data) {

            var videoDiv = $("<div>").addClass("video-model")
            $(".container").prepend(videoDiv)

            var vidModalContent = $("<div>").addClass("video-modal-content")
            videoDiv.append(vidModalContent)

            var videosClose = $("<span>").addClass("video-close")
            vidModalContent.append(videosClose)
            videosClose.html('&times;')

            videosClose.on("click", function () {

                $(".video-model").remove()
            })

            var videosDiv = $("<section>").addClass("video-display")
            vidModalContent.append(videosDiv)

            for (var i = 0; i < data.items.length; i++) {

                var videoTitle = $("<h3>").html(data.items[i].snippet.title)
                var currentIframe = $("<iframe>")

                currentIframe.attr('src', 'https://www.youtube.com/embed/' + data.items[i].id.videoId)

                videosDiv.append(videoTitle, currentIframe)
            }
        }
        getYoutube()
    })
}
workoutBtnEvent()

// modal used to schedule workouts appears when clicking on block with day/date
dayBlock.on("click", function () {

    // Empties any text lingering from pervious modal use
    inputArea.empty()

    // grabs date of clicked date block
    var workoutBlock = $(this).next()
    var clickedDt = $(this).text()

    // renders some text shown to user at top of modal
    modalText.text("Scheduled workouts for " + clickedDt + ": ")

    // Listener that ensures only one submission per click
    modalSubmit.unbind().click(function () {

        event.stopImmediatePropagation()
        event.preventDefault()

        var addedWorkout = inputArea.val()
        var workoutBtn = $("<button>").addClass("workout-btn")
        workoutBtn.text(addedWorkout)
        workoutBlock.append(workoutBtn)

        workoutBtnEvent()

        // Adds submitted workout to line under initial modal


        if (workoutList.text() === "") {

            workoutList.append(addedWorkout)
        } else {
            workoutList.append(", " + addedWorkout)
        }

        // Stores workout list as value to date key after latest workout is appended to list
        localStorage.setItem(clickedDt, workoutList.text())
    })

    // checks local storage and renders workout list if workouts exist there
    for (i = 0; i < localStorage.length; i++) {

        if (clickedDt == localStorage.key(i)) {

            workoutList.text(localStorage.getItem(clickedDt))
            console.log(localStorage.getItem(clickedDt))
            break;
        } else {

            workoutList.text("")
        }
    }

    if (localStorage.length === 0) {
        workoutList.text("")
    }

    // displays modal
    workoutModal.show()

    // close button hides modal
    closeBtn.one("click", function () {

        workoutModal.hide()
    })
})


$(".close").on("click", function () {
    var closeClicked = $(this)
    var rowDt = $(this).parent().prev().html()

    for (var s = 0; s < localStorage.length; s++) {

        if (rowDt === localStorage.key(s)) {
            localStorage.removeItem(localStorage.key(s))
            closeClicked.siblings().remove()
            break
        }
    }
})

$("#clear-btn").on("click", function () {

    var username = localStorage.getItem("username")
    localStorage.clear()

    $(".workout-btn").remove()
    localStorage.setItem("username",username)
})
