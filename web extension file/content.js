// content.js
//import * as chromeTypes from 'chrome-types';
//import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";

//  /\b(Allow|Accept|Agree|Consent|Buy|Purchase|Grant)\b/i
//  \b(Deny|Decline|Dismiss|Reject|Disagree|Refuse|Return|Revoke|Not Allow|Not Accept|Not Agree|Not Consent|Not Buy|Not Purchase|Not Grant)\b/i
//import * as tf from "@tensorflow/tfjs";
console.log("content.js");
//const model = tf.loadLayersModel("tfjs_model/model.json");
console.log("model loaded");

//counts the number of dark patterns as the no. of marked buttons/links in the page 

const darkPatternAcceptRegex = /\b(Allow|Accept|Agree|Consent|Buy|Purchase|Grant)\b/i;
const darkPatternRejectRegex = /\b(Decline|Deny|Reject|Disagree|Refuse|Return|Revoke|No|Not Allow|Not Accept|Not Agree|Not Consent|Not Buy|Not Purchase|Not Grant)\b/i;


let showMarkings = true;
let darkPatternCount = 0; 
let searchMethod = 'Regex'; // default value


let observer = new MutationObserver(detectDarkPatterns);
observer.observe(document.body, { childList: true, subtree: true });

//'http://16.171.46.233:5000/predict'
//Predict labels using the Trained Model
const predictLabel = async (inputText) => {
  const response = await fetch('http://16.171.46.233:5000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: inputText })
  });
  const data = await response.json();
  return data.label;
};


//search text content in clickable elements which matches the regex
function searchDarkPatternsRegex(element) {
  let darkPatternAcceptElements = [];//it should only have one element
  let darkPatternRejectElements = []; 

  console.log("searching In Regex Method....");

  //const clickableElements = element.querySelectorAll('a, button, [role="button"], [onclick]');
  const clickableElements = element.querySelectorAll('a, button');
  
  //predict clickableElements for labels (check for empty arrays)
  //should return a list of prediction values for each label



  //console.log(clickableElements);
  if (clickableElements.length === 0) {
    console.log("No clickable elements");
    return {isTrue: false, elements: {}};
  }


  for (const clickable of clickableElements) {
    if(clickable.textContent){
      //const label = predictLabel(clickable.textContent);
      if(darkPatternAcceptRegex.test(clickable.textContent)){
        darkPatternAcceptElements.push(clickable);
      }
      //const label = predictLabel(clickable.textContent);
      if(darkPatternRejectRegex.test(clickable.textContent)){
        //console.log("clickable.textContent");
        darkPatternRejectElements.push(clickable);
      }
    }

    /*
    if (darkPatternAcceptRegex.test(clickable.textContent)) {
          //console.log("Accept");
        //  console.log(clickable.textContent);
        //   console.log(clickable);
      darkPatternAcceptElements.push(clickable);
    } 
    
    
    if (darkPatternRejectRegex.test(clickable.textContent)) {
          //console.log("Reject");
        //   console.log(clickable.textContent);
        //  console.log(clickable);
      darkPatternRejectElements.push(clickable);
    }
    */
    //console.log(darkPatternAcceptElements.length);
    // console.log(clickable);
    // console.log(darkPatternRejectElements);
    // console.log("--");
  }

   console.log("Accept");
   console.log(darkPatternAcceptElements);
   console.log("Reject");
   console.log(darkPatternRejectElements);

  //Only one button or link is not a dark pattern
  if (clickableElements.length<2) {
    return {isTrue: false, elements: {}};
  }


  //consider darkPatternAcceptElements has only one element
  //check if the only element in darkPatternAcceptElements have the same class values 
  //and styles as all the elements in darkPatternRejectElements
  function checkSameClassAndStyle(darkPatternAcceptElements, darkPatternRejectElements){
    //let sameClassAndStyle = true;
    for (const element of darkPatternRejectElements) {
      if (element.className !== darkPatternAcceptElements[0].className || element.style.cssText !== darkPatternAcceptElements[0].style.cssText) {
        return false;
      } else {
        console.log("same class and style -- No dark pattern!!");
        return true;
      }
    }
    return false;

  }

  //No. of accept buttons = 1 and reject buttons are present and the accept button 
  //and reject buttons have different class values and styles
  if (darkPatternAcceptElements.length===1 && darkPatternRejectElements.length>0) {
    console.log("1 and >0");
    if (!checkSameClassAndStyle(darkPatternAcceptElements, darkPatternRejectElements)) {
      console.log("1 and >0");
      return {isTrue: true, elements: darkPatternAcceptElements.concat(darkPatternRejectElements)};
    } else {
      return {isTrue: false, elements: {}};
    }
  }

  //No. of accept buttons > 1 and reject buttons are present
  if (darkPatternAcceptElements.length>1 && darkPatternRejectElements.length>0) {
    console.log("1 and >0");
    return {isTrue: true, elements: darkPatternAcceptElements.concat(darkPatternRejectElements)};
  }
  //Only either one of accept buttons or reject buttons list is empty
  if (darkPatternAcceptElements.length===0 || darkPatternRejectElements.length===0) {
    // console.log(darkPatternAcceptElements.length);
    // console.log(darkPatternRejectElements.length);
    // console.log("--");
    console.log("either one of accept buttons or reject buttons list is empty");
    return {isTrue: false, elements: {}};
  }

  return {isTrue: false, elements: {}};
  
}


/*
function checkDarkPattern(element) {
  let darkPatternElements = []; 

  //any other types of clickable elements?

  //const clickableElements = element.querySelectorAll('a, button, [role="button"], [onclick]');
  const clickableElements = element.querySelectorAll('a, button, [role="button"], [onclick], [type="submit"], [type="button"]');  
  
  //Only one button or link is not a dark pattern
  if (clickableElements.length<2) {
    return {isTrue: false, elements: {}};
  }

  const styles = Array.from(clickableElements).map((clickable) => {
    const style = getComputedStyle(clickable);
    //console.log("yo");
    return {
      color: style.color,
      fontSize: style.fontSize
    };
  });

  // const styles1 = [];
  // for (let i = 0; i < clickableElements.length; i++) {
  //   const clickable = clickableElements[i];
  //   const style = getComputedStyle(clickable);
  //   const clickableStyle = {
  //     color: style.color,
  //     fontSize: style.fontSize
  //   };
  //   styles.push(clickableStyle);
  // }

  if (JSON.stringify(styles[0]) !== JSON.stringify(styles[1])) {
    
    darkPatternElements.push(clickableElements[0], clickableElements[1]);
    return {isTrue: true, elements: darkPatternElements};
  }

  return {isTrue: false, elements: {}};
}
*/


function searchDarkPatternsML(element) {
  let darkPatternAcceptElements = [];
  let darkPatternRejectElements = [];

  console.log("searching....");

  const clickableElements = element.querySelectorAll('a, button');

  if (clickableElements.length === 0) {
    console.log("No clickable elements");
    return { isTrue: false, elements: {} };
  }


  const processElement = async (clickable) => {
    if (clickable.textContent) {
      const label = await predictLabel(clickable.textContent);
      if (label === "label1") {
        darkPatternAcceptElements.push(clickable);
      } else if (label === "label2") {
        darkPatternRejectElements.push(clickable);
      }
    }
  };

  const processAllElements = async () => {
    for (const clickable of clickableElements) {
      await processElement(clickable);
    }
  };

  return processAllElements().then(() => {

    if (clickableElements.length < 2) {
      return { isTrue: false, elements: {} };
    }

    function checkSameClassAndStyle(darkPatternAcceptElements, darkPatternRejectElements) {
      let sameClassAndStyle = true;
      for (const element of darkPatternRejectElements) {
        if (element.className !== darkPatternAcceptElements[0].className || element.style.cssText !== darkPatternAcceptElements[0].style.cssText) {
          sameClassAndStyle = false;
          break;
        } else {
          console.log("same class and style -- No dark pattern!!");
        }
      }
      return sameClassAndStyle;
    }

    if (darkPatternAcceptElements.length === 1 && darkPatternRejectElements.length > 0) {
      console.log("1 and >0");
      if (!checkSameClassAndStyle(darkPatternAcceptElements, darkPatternRejectElements)) {
        console.log("1 and >0");
        return { isTrue: true, elements: darkPatternAcceptElements.concat(darkPatternRejectElements) };
      } else {
        return { isTrue: false, elements: {} };
      }
    }

    if (darkPatternAcceptElements.length > 1 && darkPatternRejectElements.length > 0) {
      console.log("1 and >0");
      return { isTrue: true, elements: darkPatternAcceptElements.concat(darkPatternRejectElements) };
    }

    if (darkPatternAcceptElements.length === 0 || darkPatternRejectElements.length === 0) {
      console.log("either one of accept buttons or reject buttons list is empty");
      return { isTrue: false, elements: {} };
    }

    return { isTrue: false, elements: {} };

  });
}



function darkPatternInCheckboxes(element) {
  let darkPatternElements = []; 

  const checkboxes = element.querySelectorAll('input[type="checkbox"]');
  if (checkboxes.length === 0) {
    return {isTrue: false, elements: {}};
  }

  for (const checkbox of checkboxes) {
    if (checkbox.checked) {
      const label = element.querySelector(`label[for="${checkbox.id}"]`);
      if (label) {
        darkPatternElements.push(checkbox, label);
      } else {
        darkPatternElements.push(checkbox);
      }
    }
  }

  if (darkPatternElements.length>0) {
    return {isTrue: true, elements: darkPatternElements};
  }
  
  return false;

}

function markDarkPatternInArrays(darkPatternElements){
  for (const element of darkPatternElements) {
    markDarkPattern(element);
  }
}


function markDarkPattern(element) {

  if(showMarkings){
    console.log("marking...");
    console.log(element.textContent);
    console.log(element);
    element.style.border = "5px solid red";
    //darkPatternCount++;
    //console.log(element);
    //element.classList.add("blinking-border");
  } else {
    //remove the blinking border from the element
    element.style.border = "none";
    //element.classList.remove("blinking-border");
  }
}



async function detectDarkPatterns(searchMethod) {
  darkPatternCount = 0;
  const divs = document.querySelectorAll('div');
  for (const d1 of divs) {
    let searchResult;
    if (searchMethod === 'ML') {
      searchResult = await searchDarkPatternsML(d1);
    } else if (searchMethod === 'Regex') {
      searchResult = searchDarkPatternsRegex(d1);
    }
    if (searchResult.isTrue) {
      //console.log(d1);
      markDarkPatternInArrays(searchResult.elements);
      darkPatternCount++;
      //darkPatternCount counts the entire document box as one dark pattern
    }
     
    const checkboxResult = darkPatternInCheckboxes(document);
    if (checkboxResult.isTrue) {
      //console.log(darkPatternInCheckboxes(document).elements);
      markDarkPatternInArrays(checkboxResult.elements);
      darkPatternCount++;
      //darkPatternCount counts the entire form as one dark pattern
    }
  
  }
}


detectDarkPatterns(searchMethod);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'toggle') {
      showMarkings = request.showMarkings;
    } else if (request.type === 'getCount') {
      sendResponse({darkPatternCount: darkPatternCount});
    } else if (request.type === 'changeMethod') {
      //remove the markings
      showMarkings = false;
      detectDarkPatterns(searchMethod);

      searchMethod = request.searchMethod;
    }
    detectDarkPatterns(searchMethod);
  }
);
