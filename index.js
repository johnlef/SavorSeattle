  
   
   
 
//const reminderRequest =  'This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).'
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.


// Todo:
//  Add reminders
//  Add announcements
//  Add DEMO mode (time shrinking) and UI for it
//  Add logging
//  What does it take tobe published.Ee
// The nodes in the hash table should come from the array

//   The stops are placed in the array in the ordr of the tour.



var EATTourNodes=[];
    EATTourNodes[0] = 'start of tour';
    EATTourNodes[1] = 'honest biscuit';
    EATTourNodes[2] = 'los agaves';
    EATTourNodes[3] = 'daily dozen';
    EATTourNodes[4] = 'pike place fish';
    EATTourNodes[5] = 'market spice';
    EATTourNodes[6] = 'miss cafe';
    EATTourNodes[7] = 'indi chocolate';
    
    var stopname = 'new stop';
    var duration = 5;
    var offset = 0;
    
    var netTimeInMinutes = 0;
    var travelTimeInMinutes = 0;
    var durationInMinutes = 0;
    const SCALINGFACTOR = 10;
    
    const DURATION = 0;
    const TRAVEL = 1;
    const NEXTNODE = 2;
    const NOTES = 3;
  
        //Tour Node, Duration, Travel time to next node, name of next node, arbitrary text to communicate
        var locationhash = [];
        locationhash['start of tour'] = [10, 1, 'honest biscuit', 'Reminder to call ahead to Los Agaves'];
        locationhash['honest biscuit']= [7,10,'Los Agaves','Reminder to call ahead toDailyDozen'];
        locationhash['los agaves'] = [7, 10, 'daily dozen',''];
        locationhash['daily dozen'] = [6, 2, 'pike place fish',''];
        locationhash['pike place fish'] = [11, 3, 'market spice',''];
        locationhash['market spice'] = [9, 12, 'miss cafe','Reminder to call ahead to Rub With Love'];
        locationhash['miss cafe'] = [8, 13,'rub with love',''];
        locationhash['rub With love'] = [8, 4, 'indi chocolate',''];
        locationhash['indi chocolate'] = [9, 0, 'closing',''];
        

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        var speakOutput =  'Do you want me to setup reminders for the tour';
        const repromptText = 'I can provide reminders for when you should be moving to you next tour stop.  Do you want me to set them up';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};

// This handler is not active at this time as there is no need to know when the tour starts.
const StartTimeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartTimeIntent';
    },
    handle(handlerInput) {
        
        const  starttime = handlerInput.requestEnvelope.request.intent.slots.starttime.value;
        const speakOutput = `I understand the tour begins at ${starttime}.`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
        }
    };
    


const CreateReminderIntentHandler = {
    
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
   // Update it to check for AMAZON.YesIntent
    handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent";
  },
  //if (handlerInput.requestEnvelope.request.intent.value <> 'Yes') {} else
  //{
  handle(handlerInput) {
   const remindersApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient(),
    //Use ES6 destructor assignment syntax to declare and set permissions object in one step 
        { permissions } = handlerInput.requestEnvelope.context.System.user
        
        //reminderRequesteminders get set if pemissions allow
        if(!permissions) {
        return handlerInput.responseBuilder
        .speak("Please enable reminders permissions in the Amazon Alexa app")
        .withAskForPermissionsConsentCard(["alexa::alerts:reminders:skill:readwrite"])
        .getResponse()
  }
  
  var numberofstops = EATTourNodes.length;
  offset = 0;
  numberofstops = 4;
  // The loop where the reminders get set
  for (var i=0; i<numberofstops;i++) {
   stopname = EATTourNodes[i]; 
   durationInMinutes = parseInt(locationhash[stopname][0]);
   travelTimeInMinutes = parseInt(locationhash[stopname][1]);
   netTimeInMinutes = netTimeInMinutes+travelTimeInMinutes + durationInMinutes;
   offset = netTimeInMinutes;
   //var durationInSeconds = durationInMinutes * 60;
   //var offsetInSeconds =  parseInt(offset + durationInSeconds);
  //}
  
    
    var reminderRequest = {
    trigger: {
      type: "SCHEDULED_RELATIVE",
     offsetInSeconds: `${offset.toString()}`,
    },
    alertInfo: {
      spokenInfo: {
        content: [{
          locale: "en-US",
          text: `Next stop in 30 seconds is ${stopname} with ${durationInMinutes} minutes to talk`,
        }],
      },
    },
    pushNotification: {
      status: "ENABLED"
    }

  } 
 // }
  
  
  remindersApiClient.createReminder(reminderRequest);
  }

  return handlerInput.responseBuilder
         .speak (`${handlerInput.requestEnvelope.request.intent.value} loopcount: ${i} net: ${netTimeInMinutes} travel: ${travelTimeInMinutes} duration: ${durationInMinutes} `)
         .getResponse();
  
  }
  
}

const TourNodeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TourNodeIntent';
    },
    
    handle(handlerInput) {
        
        
        const node = handlerInput.requestEnvelope.request.intent.slots.node.value;
        var time = locationhash[node][0];
        var travel = locationhash[node][1];
        var nextstop = locationhash[node][2];
        var notes = locationhash[node][3];
        const speakOutput = `${locationhash[0]} you are at ${node} with ${time} minutes to talk. You then have ${travel} minutes to get to your next stop ${nextstop}, ${notes}`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('where are you')
            .getResponse();
        }
    }
    
    const CaptureBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureBirthdayIntent';
    },
    
    handle(handlerInput) {
        const year = handlerInput.requestEnvelope.request.intent.slots.year.value;
        const month = handlerInput.requestEnvelope.request.intent.slots.month.value;
        const day = handlerInput.requestEnvelope.request.intent.slots.day.value;
        const speakOutput = `Yes Thanks, Ill remember that you were born ${month} ${day} ${year}.`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
        }
    };
    
    
    const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        //CaptureBirthdayIntentHandler,
        //StartTimeIntentHandler,
        HelpIntentHandler,
        TourNodeIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        CreateReminderIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(ErrorHandler
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
    
