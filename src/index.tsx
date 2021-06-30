import React, { useCallback, useState } from 'react';

/**
 * main hook which will give you the functionality
 * to execute your logic in steps
 *
 *
 * Usage Example:
 * ```typescript
 * const startStep = 0;
 * const stepsAndHandlers = [
 *      [
 *          (previousOutput, state, setState) => { return newOutput;},
 *          (previousOutput, state, setState) => { return newOutput2;}
 *      ], //first step and their handlers
 *
 *      [
 *          (previousOutput, state, setState) => { return newOutput;},
 *          (previousOutput, state, setState) => { return newOutput2;}
 *      ] //second step and their handlers
 * ];
 * const {
 *      currentStep,
 *      execute,
 *      isCompleted,
 *      isSuccess,
 *      isLoading,
 *      next,
 *      isAllDone
 * } = useStepwiseExecution(stepsAndHandlers, startStep);
 * ```
 * @param {StepsAndHandlersMapType} stepsHandlers an array of steps and their handlers. this will
 * @param {Number} initialStep execution will start from this step
 * set how many steps are there
 */
export const useStepwiseExecution = (
    stepsHandlers: StepsAndHandlersType,
    initialStep = 0
) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [stepsAndHandlers, setStepsAndHandlers] = useState(stepsHandlers);
    const [stepOutput, setStepOutput] = useState<any>(undefined);
    const [status, setStatus] = useState<StepExecutionStatus>('notstarted');
    const [isAllDone, setIsAllDone] = useState<boolean>(false);
    const [sharedState, setSharedState] = useState<any>({});

    /**
     * this will update the current step.
     *
     * NOTE: this will not reset the `isLoading`, `isCompleted`,
     * and `isSuccess` flags. so use it very carefully
     *
     * Better Options: use `next` to move to next step gracefully
     * or use `setCurrentStepAndReset` or `moveToStep` to gracefully move
     * to a specific step.
     *
     * @param {Number} step
     */
    const setCurrentStepOnly = useCallback(
        (step: number) => {
            setCurrentStep(step);
        },
        [setCurrentStep]
    );

    /**
     * this will gracefully move the execution to a specific
     * step by setting the specifc step number and reseting
     * all status flags like `isLoading`, `isCompleted`, `isSuccess`
     *
     * @param {Number} step
     */
    const setCurrentStepAndReset = useCallback((step: number) => {
        setCurrentStep(step);
        setStatus('notstarted');
    }, []);

    /**
     * this will gracefully move the execution to a specific
     * step by setting the specifc step number and reseting
     * all status flags like `isLoading`, `isCompleted`, `isSuccess`
     *
     * NOTE: this and `setCurrentStepAndReset` gives same functionality
     * and this is literally an alias of `setCurrentStepAndReset` function.
     *
     * @param {Number} step
     */
    const moveToStep = setCurrentStepAndReset;

    /**
     * this will move to next step
     * only if the previous step gets successfully
     * executed.
     *
     * NOTE: If force is true then it will move
     * to the next without caring whether the previous
     * step was successfull or not
     *
     * @param {Boolean} force
     */
    const next = useCallback(
        (force = false) => {
            if (force || status === 'success') {
                //if is all steps executed
                if (currentStep >= stepsAndHandlers.length - 1) {
                    setIsAllDone(true);
                } else {
                    setCurrentStep(previousStep => {
                        return previousStep + 1;
                    });
                    setStatus('notstarted');
                }
            }
        },
        [currentStep, status, stepsAndHandlers]
    );

    /**
     * this function will execute all handlers
     * of the current step one by one and will
     * return the final output of tha last handler
     * of the current step.
     *
     * Note: if the current step is already executed
     * successfully and you try to execute it again it will
     * not execute it again and will just return the output
     * of last execution
     *
     * Note: if you really want to execute the current step
     * again then send force parameter as true
     *
     * @param {Boolean} force by default it is false
     *
     */
    const execute = useCallback(
        async (force = false) => {
            if (stepsAndHandlers.length < 1) {
                return null;
            }
            if (!force && status === 'success') {
                return stepOutput;
            }
            try {
                setStatus('inprogress');
                const finalOutput = await stepsAndHandlers[currentStep].reduce(
                    async (previousOutputPromise, nextHandler) => {
                        const previousOutput = await previousOutputPromise;
                        return await nextHandler(
                            previousOutput,
                            sharedState,
                            setSharedState
                        );
                    },
                    Promise.resolve(stepOutput)
                );
                setStepOutput(finalOutput);
                setStatus('success');
                return finalOutput;
            } catch (e) {
                setStatus('error');
                throw e;
            }
        },
        [currentStep, stepsAndHandlers, status, sharedState, stepOutput]
    );

    return {
        /**
         * current step of the execution
         * is.
         * @type {number}
         */
        currentStep,

        /**
         * this function will execute all handlers
         * of the current step one by one and will
         * return the final output of tha last handler
         * of the current step.
         *
         * Note: if the current step is already executed
         * successfully and you try to execute it again it will
         * not execute it again and will just return the output
         * of last execution
         *
         * Note: if you really want to execute the current step
         * again then send force parameter as true
         *
         * @param force boolean by default it is false
         *
         */
        execute,

        /**
         * this will tell the status of current step execution.
         * It will have one of the following values to show our execution status
         * of current step:
         *
         * ```
         * 'notstarted' | 'inprogress' | 'success' | 'error'
         * ```
         *
         * @type {StepExecutionStatus}
         */
        status: status,

        /**
         * whenever the current step execution is running
         * this will be true.
         *
         * @type {Boolean}
         */
        isLoading: status === 'inprogress',

        /**
         * this will move to next step
         * only if the previous step gets successfully
         * executed.
         * NOTE: If force is true then it will move
         * to the next without caring whether the previous
         * step was successfull or not
         *
         * @param {Boolean} force
         */
        next,

        /**
         * this will gracefully move the execution to a specific
         * step by setting the specifc step number and reseting
         * all status flags like `isLoading`, `isCompleted`, `isSuccess`
         *
         * NOTE: this and `setCurrentStepAndReset` gives same functionality
         * and this is literally an alias of `setCurrentStepAndReset` function.
         *
         * @param {Number} step
         */
        moveToStep,

        /**
         * this will tell whether the execution has successfully
         * completed the last step or not
         *
         * NOTE: this wont tell whether all steps gets executed. Because
         * you can bypass some steps by using `moveToStep` or `setCurrentStepAndReset`.
         * So if you did not bypass any step then this will surely tell
         * whether all the steps are executed or not.
         *
         * @type {Boolean}
         */
        isAllDone,

        /**
         * this is the state which will be shared
         * amongst all steps and their handlers.
         * @type {any}
         */
        sharedState,

        /**
         * this will update the shared state which
         * is accessible to all the steps and to all
         * their handlers. whatever you'll pass to
         * this function will be treated as shared state.
         *
         * e.g
         * ```
         * updateSharedState({firstName: 'john', lastName: 'Doe'});
         * ```
         *
         * NOTE: if you just want to update some value in the
         * shared state not overwrite the whole state then pass
         * function.
         *
         * e.g
         * ```
         * updateSharedState((previousState: any) => {
         *    return {
         *        ...previousState,
         *        firstName: 'fs name',
         *        lastName: 'ls name'
         *    };
         * });
         * ```
         *
         */
        updateSharedState: setSharedState,

        /**
         * this will hold the output of current step execution.
         * if the current step execution has not run yet then it
         * will hold the previous step execution output
         * @type {any}
         */
        stepOutput,

        /**
         * registered steps and their handlers
         *
         * @type {StepsAndHandlersMapType}
         */
        stepsAndHandlers,

        /**
         * These setters are not recommended for consumer
         * and are being used in the internal working of this hook.
         *
         * But if you know what you are doing then you can have
         * full control over this hook and its functionality using
         * these setters.
         *
         * CAUTION: Do not use these if you are not sure. because
         * these setters will change the behavior of the step
         * wise execution
         */
        setters: {
            setCurrentStepOnly,
            setCurrentStepAndReset,
            setSharedState,
            setStepsAndHandlers,
            setStepOutput,
            setStatus,
            setIsAllDone,
        },
    };
};



/**
 * Interface of a step handler function
 */
export type StepHandlerType = (
    data: any,
    sharedState: any,
    setSharedState: React.Dispatch<any>
) => Promise<any>;

/**
 * Interface of a step
 */
export type StepType = Array<StepHandlerType>;

/**
 * this is the actual interface of defining steps and their handlers
 * our useStepwiseExecution hook accept this interface to register all
 * steps and their handlers
 *
 * *<Note:> each index in the main array is a step where are all
 * elements in the child array of handlers of that step</Note:>
 *
 * *<Note:> output of first step will be input of next handler. The
 * second parameter is shared state which can be accessed. The
 * third parameter is shared state setter. Through which you can
 * update the shared state between all handlers of all step</Note:>
 *
 * *<Note:> if you want to break the loop of handlers then
 * just throw an error because otherwise a step will be
 * considered complete when its all handlers run successfully
 * without any error</Note:>
 *
 * *<Note:> all the handlers must be async of return promise</Note:>
 *
 * e.g
 *```typescript
 *  const StepHandlers: StepsAndHandlersMapType = [
 *
 *       [
 *          //handlers of this step
 *       ], //first step
 *
 *       [
 *          //handlers of this step
 *       ], //second step
 *
 *       [
 *          //handlers of this step
 *       ], //third step
 *  ];
 *```
 *
 * */
export type StepsAndHandlersType = Array<StepType>;

/**
 * every step will have one the following status showing
 * where its execution is
 */
export type StepExecutionStatus =
    | 'notstarted'
    | 'inprogress'
    | 'success'
    | 'error';