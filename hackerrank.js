const { Email, Password } = require("./secret.js");
const puppeteer = require("puppeteer");
let { answer } = require("./codes");
let curTab;

let browserOpenPromise = puppeteer.launch({ // creates browser instance and returns the promise
  headless: false, // if headless is TRUE it means bina chrome open huve meri testing hojaye
  defaultViewport: null, // Default Port 
  args: ["--start-maximized"], // Arguments
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome",
});
// console.log(browserOpenPromise);
browserOpenPromise //fulfill
  .then(function (browser) {
    // parameter is given by parent 
    // insted of browser we can write hatti also
    // we get browser from launch
    // console.log(browserOpenPromise);
    console.log("browser is open");
    let allTabsPromise = browser.pages(); // An array of all open pages inside the Browser.
    return allTabsPromise; // it will return object
  })
  .then(function (allTabsArr) {
    curTab = allTabsArr[0]; // browser ka first tab ,  curTab is global variable . 
    console.log("new tab");
    let visitingLoginPagePromise = curTab.goto(
      "https://www.hackerrank.com/auth/login"
    ); // URL to navigate page to
    return visitingLoginPagePromise;
  })
  .then(function () {
    console.log("Hackerrank login page opened");
    let emailWillBeTypedPromise = curTab.type("input[name='username']", Email, {
      delay: 100,
    });
    return emailWillBeTypedPromise;
  })
  .then(function () {
    console.log("email is typed");
    let passwordWillBeTypedPromise = curTab.type(
      "input[type='password']",
      Password,
      { delay: 100 }
    );
    return passwordWillBeTypedPromise;
  })
  .then(function () {
    console.log("password has been typed");
    let willBeLoggedInPromise = curTab.click(
      ".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled"
    );
    return willBeLoggedInPromise;
  })
  .then(function () {
    console.log("logged into hackerrank successfully");
    // waitAndClick will wait for entire selector to load , and then it will click on the node
    // these algorithmTabWillBeOpenedPromise is waiting for promise
    let algorithmTabWillBeOpenedPromise = waitAndClick(
      "div[data-automation='algorithms']"
    );
    return algorithmTabWillBeOpenedPromise;
  })
  .then(function () {
    console.log("algorithm pages is open");
    let allQuesPromise = curTab.waitForSelector(
      'a[data-analytics="ChallengeListChallengeName"]'
    );
    return allQuesPromise;
  })
  .then(function () {
    function getAllQuesLinks() {
      let allElemArr = document.querySelectorAll(
        'a[data-analytics="ChallengeListChallengeName"]'
      );
      let linksArr = [];
      for (let i = 0; i < allElemArr.length; i++) {
        linksArr.push(allElemArr[i].getAttribute("href"));
      }
      return linksArr;
    }
    let linksArrPromise = curTab.evaluate(getAllQuesLinks);
    return linksArrPromise;
  })
  .then(function (linksArr) {
    console.log("links to all ques retrived");
    // console.log(linksArr); //Q solve krna hai
    let questionWillBeSolvedPromise = questionSolver(linksArr[0], 0);
    for (let i = 1; i < linksArr.length; i++) {
      let questionWillBeSolvedPromise = questionWillBeSolvedPromise.then(
        function () {
          return questionSolver(linksArr[i], i);
        }
      );
    }
    return questionWillBeSolvedPromise;
  })
  .then(function () {
    console.log("question is solved");
  })
  .catch(function (err) {
    console.log("error");
  });

function waitAndClick(selector) {
  let waitClickPromise = new Promise(function (resolve, reject) {
    let waitForSelectorPromise = curTab.waitForSelector(selector);
    waitForSelectorPromise
      .then(function () {
        let clickPromise = curTab.click(selector);
        return clickPromise;
      })
      .then(function () {
        console.log("Quetion btn is clicked");
        resolve();
      })
      .catch(function (err) {
        reject(err);
      });
  });
  return waitClickPromise;
}

function questionSolver(url, idx) {
  return new Promise(function (resolve, reject) {
    let fullLink = `https://www.hackerrank.com${url}`;
    let goToQuesPagePromise = curTab.goto(fullLink);
    goToQuesPagePromise
      .then(function () {
        console.log("Question opened");
        // tick the custom input box mark
        let waitForCheckBoxAndClickPromise = waitAndClick(".checkbox-input");
        return waitForCheckBoxAndClickPromise;
      })
      .then(function () {
        // select the box where code will be typed
        let waitForTextBoxPromise = curTab.waitForSelector(".custominput");
        return waitForTextBoxPromise;
      })
      .then(function () {
        let codeWillBeTypedPromise = curTab.type(".custominput", answer[idx]);
        return codeWillBeTypedPromise;
      })
      .then(function () {
        // Press ctrl key
        let controlPressedPromise = curTab.keyboard.down("Control");
        return controlPressedPromise;
      })
      .then(function () {
        // select all code
        let aKeyPressedPromise = curTab.keyboard.press("A");
        return aKeyPressedPromise;
      })
      .then(function () {
        // copy all code , ctrl is already press over her here figure is not removed from ctrl
        let xKeyPressedPromise = curTab.keyboard.press("X");
        return xKeyPressedPromise;
      })
      .then(function () {
        // Press ctrl key
        let controlDownPromise = curTab.keyboard.up("Control");
        return controlDownPromise;
      })
      .then(function () {
        //Select the editor
        let cursorOnEditorPromise = curTab.click(
          ".monaco-editor.no-user-select.vs"
        );
        return cursorOnEditorPromise;
      })
      .then(function () {
        // Press ctrl key
        let controlPressedPromise = curTab.keyboard.down("Control");
        return controlPressedPromise;
      })
      .then(function () {
        // select all code of editor
        let aKeyPressedPromise = curTab.keyboard.press("A", { delay: 100 });
        return aKeyPressedPromise;
      })
      .then(function () {
        // copy code on editor
        let vKeyPressedPromise = curTab.keyboard.press("V", { delay: 100 });
        return vKeyPressedPromise;
      })
      .then(function () {
        // Press ctrl key
        let controlDownPromise = curTab.keyboard.up("Control");
        return controlDownPromise;
      })
      .then(function () {
        let clickSubmitBtnPromise = curTab.click(".hr-monaco-submit");
        return clickSubmitBtnPromise;
      })
      .then(function () {
        console.log("code submitted successfully");
        resolve();
      })
      .catch(function (err) {
        reject(err);
      });
  });
}
