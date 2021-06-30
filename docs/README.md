use-stepwise-execution / [Exports](modules.md)

# React useStepwiseExecution Hook

This react hook will give you the funtionality to perform a long and complex logic or multiple linked logics through multiple simple steps and will give you full control over each step so you can build more sophisticated functionality around it.

## Installation

You can install this hook using the following command:

```bash
npm i --save use-stepwise-hook # or yarn add use-stepwise-hook
```

## API Docs

See [Api Docs](docs/modules.md)

## Usage Example

Suppose we have page where a user puts his `first name`, `last name`, `email address`, `password`
and `credit card details` to purchase a subscription. Now, what we want is that user can subscribe given:

  1. If the user account is not created then create it using the given information.
  2. if the user account already exists then login it first using the given `email address` and `password`.
  3. if the email is not verified whether it is newly created or the account already exists then prompt user to verify the email address. And must not go onward until the email is verified.
  4. Once, all of the previous requirements are fulfilled then use the credit card info and verify its valid.
  5. Once the card is valid then perform subscription.
  6. On subscription success, subscription redirect the user to somewhere desired
  7. On subscription failure, show the user whats wrong

Now this is one hell of a long logic to accomplish one thing which is subscription and each step is very crucial. We want to implement this in react and we dont want to miss any step or moves to the next step without passing the previous step. So thats where our `useStepwiseExecution` hook comes to rescue.

```javascript
import { useStepwiseExecution } from "use-stepwise-execution";
import stepsAndHandlers from "./subscription-steps"; // this file will contain all our logic in steps

const SubscriptionPage = (props: any) => {
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    cardInfo: {}
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    currentStep, // current step which is either executed or needs to execute
    isLoading, // if current step execution is in progress or not
    status, // current step execution status
    next, //this will move the execution to next step
    execute, //this will execute all the handlers of current step
    isAllDone, //is true when the last step is successfully executed
    updateSharedState // function to update the state which is accessibel to all step handlers
  } = useStepwiseExecution(stepsAndHandlers, 0); //0 means start the execution from step 0, whereas second param is all about steps and their handlers

  //whenever form values change, update the form values
  // in the shared state, so our step handlers can use them
  useEffect(() => {
    updateSharedState((previousState: any) => ({
      ...previousState,
      form: formData
    }));
  }, [formData]);

  //on submission of form run the steps
  useEffect(() => {
    //if submit button is clicked, and 
    if (isSubmitting && status !== "success") {
      //execute all the handlers of current step
      !isLoading && execute().then(() => {
        //on successful execution of current step
        //moves to next step
        next();
      }).catch(e => {
        //on encountering error in the execution of current step
        //show the respective message to user or ask for changes
        //and stop the execution here
        setIsSubmitting(false);
      });
    }
  }, [isSubmitting, status, isLoading]);

}

```

That's it. What we have done here is just set up structure of execution. and we have taken all the logic away from the component to a separate file `subscription-steps.ts` which will only contain step and their handlers (functions). We wont be interacting with UI there. Our whole focus there, will be to create step and their handlers (functions) where each step will perform a specific task only.

Now lets see what's inside `subscription-steps.ts`

```javascript
import { StepHandlerType } from "use-stepwise-hook";

const stepsAndHandlers: Array<Array<StepHandlerType>> = [
  [
    (po, sharedState, setSharedState) => {
        //create an account with given information which is stored in sharedState

        return {
          status: "success"
        }; // whatever you want to send just to let the next handler know what happens here and what you need to do according
    },
    (po, sharedState, setSharedState) => {
        if (po.status === "success") { //account is created.
          return po;
        }
        //otherwise try to logic through email and address
        //if login success then return true otherwise throw
        //an error 
        return true;
    },
  ], //first step
  [
    (po, sharedState, setSharedState) => {
        //po is true
        //logic to check email is verified or not
        //if verified return true otherwise throw error
        //to stop the execution here and let the user know
        if (notverified) {
          throw {
            type: "error",
            message: "Email is not verified",
            code: "unverifed-email"
          };
        }
        return true
    }
  ], //Second step

  [
    (po, sharedState, setSharedState) => {
      //logic to check the credit card info
      return true;
    },
    (po, sharedState, setSharedState) => {
      //logic to attach the card to the user created account on valid card
      return true;
    },
  ], // Third step
  [
    (po, sharedState, setSharedState) => {
      //logic to perfoma payment from the card for subscription
      //throw any error when you want to stop execution here or to show some data to user
      return true;
    }
  ], // fourth step
  [
    (po, sharedState, setSharedState) => {
      //verify subscription and everything is done here
      return true;
    },
  ]

];

```

<!-- 
const stepsAndHandlers: Array<Array<StepHandlerType>> = [
  [], //step one. it has no handlers. it is empty. I have left it empty for nothing :P .
  [
    (po, sharedState, setSharedState) => {
      //suppose sharedState is an empty object
      //sharedState = {}
      setSharedState((ps: any) => ({
        ...ps,
        token: "123"
      }));
      //your logic
      return "anything";
    }, // first handler 'of step two
    (po, sharedState, setSharedState) => {
      //here po = "anything"
      //sharedState = {}
      return "nothing";
    }, // second handler of step two
    (po, sharedState, setSharedState) => {
      //here po = "nothing"
      //sharedState = {}
      return "nothing";
    }, // third handler of step two
    .
    .
    .
    (po, sharedState, setSharedState) => {
      //sharedState = {}
      return ["everything"];
    }, // Nth handler of step two
  ], //Second step

  [
    (po, sharedState, setSharedState) => {
      //here po = ["everything"]
      //sharedState = {token: "123"}
      //your logic
      return "anything";
    }, // first handler 'of step two
  ] // Third step
];
-->
