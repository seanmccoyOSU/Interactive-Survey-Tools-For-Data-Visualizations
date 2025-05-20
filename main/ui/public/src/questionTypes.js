/** questionTypes.js
 * 
 *  USE THIS FILE TO ADD NEW QUESTION TYPES
 *  
 *  Simply add a new object to the questionTypes array below
 *  The object must follow this format:
 * 
 *  {
 *      name: string
 *          // the internal name of the question type
 * 
 *      label: string
 *          // label for the question type in the survey editor
 * 
 *      description: string
 *          // description for the question type in the survey editor
 * 
 *      hasRequired: bool
 *          // true if the question type can be set to required
 * 
 *      hasMinMax: bool
 *          // true if the question type has minimum and maximum properties
 * 
 *      hasChoices: bool
 *          // true if the question type has pre-set choices that the user selects from
 * 
 *      minText: string
 *          // label for the minimum property in the editor
 * 
 *      maxText: string
 *          // label for the maximum property in the editor
 * 
 *      requiresVisual: bool
 *          // true if the question type requires a visual
 * 
 *      getPromptString: function(min: int, max: int) -> string
 *          // function that returns a string for the prompt that is displayed while taking the survey
 *          // the prompt is usually based on the minimum and maximum requirement for the question
 *          
 *      checkRequirement: function(min: int, max: int, required: bool, onFailure: function(string), onSuccess: function())
 *          // function that checks the current answer against the requirement (min and max parameters, which are integers)
 *          // if the user has failed to meet the requirement, call the callback onFailure(message) where message is a string telling the user what they did wrong
 *          // if the user has succeeded, call the callback onSuccess()
 *          // this function is capable of manipulating the DOM
 * 
 *      getResponse: function(onGet: function())
 *          // function that collects the response, formats it into a string, and passes it through the callback onGet(response)
 *          // this function is capable of manipulating the DOM
 * 
 *      (optional) onPageLoaded: function()
 *          // function that is called when the page with the question is finished loading while taking the survey
 *          // this function is capable of manipulating the DOM
 * 
 *      (optional) onVisualLoaded: function()
 *          // function that is called when the visualization window is finsished loading while taking the survey
 *          // this function is capable of manipulating the DOM
 * 
 *      (optional) pageRenderOptions: Object
 *          // object containing addtional options that are passed through when rendering the question page while taking the survey
 *          // you must edit takeSurveyPage.handlebars if you want to change how the html is rendered for the specific question type
 *  }
 * 
 * 
 ***************************************************************************************************************************************************************/


const questionTypes = [
    /**************************************************************************** 
     * Multiple Choice
    *****************************************************************************/
    {
        name: "Multiple Choice",
        label: "Multiple Choice",
        description: "User checks boxes from a list of pre-written choices as a response",
        hasRequired: true,
        hasMinMax: true,
        hasChoices: true,
        minText: "Minimum required selections",
        maxText: "Maximum allowed selections",
        requiresVisual: false,
        getPromptString: function(min, max) {
            let requirement = ""

            if (min < 1 && max < 1) {
                requirement = "items"
            } else if (min == max) {
                if (min == 1)
                    requirement = "exactly 1 item"
                else 
                    requirement = `exactly ${min} items`
            } else if (max < 1) {
                if (min == 1)
                    requirement = "at least 1 item"
                else
                    requirement = `at least ${min} items`
            } else if (min < 1) {
                if (max == 1)
                    requirement = "at most 1 item"
                else
                    requirement = `at most ${max} items`
            } else {
                requirement = `${min} to ${max} items`
            }

            return `Select ${requirement}`
        },
        checkRequirement: function(min, max, required, onFailure, onSuccess) {
            const boxes = document.getElementsByClassName("multiple-choice-box")
            let total = 0
            for (const box of boxes) {
                if (box.checked) {
                    total += 1
                }
            }

            if (max > 0 && total > max) {
                if (max > 1)
                    onFailure(`You cannot select more than ${max} choices`)
                else
                    onFailure(`You cannot select more than ${max} choice`)
            } else if (min > 0 && total < min) {
                if (min > 1)
                    onFailure(`You must select at least ${min} choices`)
                else
                    onFailure(`You must select at least ${min} choice`)
            } else {
                onSuccess()
            }
        },
        getResponse: function(onGet) {
            const boxes = document.getElementsByClassName("multiple-choice-box")
            let response = ""
            for (const box of boxes) {
                if (box.checked) {
                    response += box.value + '|'
                }
            }

            if (response == "")
                onGet(response)
            else
                onGet(response.slice(0, -1))
        },
        pageRenderOptions: {
            multipleChoice: true
        }
    },
    /**************************************************************************** 
     * 
    *****************************************************************************/
]

export default questionTypes