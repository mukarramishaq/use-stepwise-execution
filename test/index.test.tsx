import { renderHook, act, RenderResult } from "@testing-library/react-hooks";
import useStepwiseExecution, { StepsAndHandlersMapType } from "../src";


describe("Initialization of the hook", () => {
    const { result } = renderHook(({ initialStep, stepsAndHandlers }: { initialStep: number, stepsAndHandlers: StepsAndHandlersMapType }) => {
        return useStepwiseExecution(initialStep, stepsAndHandlers)
    }, { initialProps: { initialStep: 0, stepsAndHandlers: [] } });
    test("testing return data from hook first call", async () => {
        expect(result.current.currentStep).toBe(0);
        expect(result.current.isAllDone).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.status).toMatch("notstarted");
        expect(result.current.stepOutput).toBeUndefined();
        expect(result.current.sharedState).toEqual({});
    });
});

describe("Before executing a step", () => {
    const { result } = renderHook(({ initialStep, stepsAndHandlers }: { initialStep: number, stepsAndHandlers: StepsAndHandlersMapType }) => {
        return useStepwiseExecution(initialStep, stepsAndHandlers)
    }, { initialProps: { initialStep: 0, stepsAndHandlers: [] } });
    test("testing current step", async () => {
        expect(result.current.currentStep).toBe(0);
    });
    test("testing current step", async () => {
        expect(result.current.isLoading).toBe(false);
    });
    test("testing status of current step", async () => {
        expect(result.current.status).toMatch("notstarted");
    });
    test("testing step output", async () => {
        expect(result.current.stepOutput).toBeUndefined();
    });
    test("testing shared state", async () => {
        expect(result.current.sharedState).toEqual({});
    });
    test("testing isAllDone flag", async () => {
        expect(result.current.isAllDone).toBe(false);
    });
    test("testing setting shared state", async () => {
        const { result } = renderHook(({ initialStep, stepsAndHandlers }: { initialStep: number, stepsAndHandlers: StepsAndHandlersMapType }) => {
            return useStepwiseExecution(initialStep, stepsAndHandlers)
        }, { initialProps: { initialStep: 0, stepsAndHandlers: [] } });
        act(() => {
            result.current.updateSharedState(() => "hello");
        });
        expect(result.current.sharedState).toMatch("hello");
    });
});

describe("While executing a step", () => {
    let result: RenderResult<any> | undefined;

    beforeEach(() => {
        const { result: rs } = renderHook(({ initialStep, stepsAndHandlers }: { initialStep: number, stepsAndHandlers: StepsAndHandlersMapType }) => {
            return useStepwiseExecution(initialStep, stepsAndHandlers)
        }, {
            initialProps: {
                initialStep: 0, stepsAndHandlers: [
                    [
                        async () => {
                            return await new Promise((res) => setTimeout(() => res(1), 100));
                        }
                    ]
                ]
            }
        });
        result = rs;
        act(() => {
            result?.current.execute();
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test("testing current step", async () => {
        expect(result?.current.currentStep).toBe(0);
    });
    test("testing isLoading flag", async () => {
        expect(result?.current.isLoading).toBe(true);
    });
    test("testing status of current step", async () => {
        expect(result?.current.status).toMatch("inprogress");
    });
    test("testing step output", async () => {
        expect(result?.current.stepOutput).toBeUndefined();
    });
    test("testing shared state", async () => {
        expect(result?.current.sharedState).toEqual({});
    });
    test("testing isAllDone flag", async () => {
        expect(result?.current.isAllDone).toBe(false);
    });
});

describe("After successful execution of a step", () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(() => {
        const { result: rs } = renderHook(({ initialStep, stepsAndHandlers }: { initialStep: number, stepsAndHandlers: StepsAndHandlersMapType }) => {
            return useStepwiseExecution(initialStep, stepsAndHandlers)
        }, {
            initialProps: {
                initialStep: 0, stepsAndHandlers: [
                    [
                        async () => {
                            return 100;
                        }
                    ]
                ]
            }
        });
        result = rs;
        // waitForNextUpdate = wfnu;
    });

    afterEach(() => {
        result = undefined;
    });

    test("testing current step", async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.currentStep).toBe(0);
    });
    test("testing isLoading flag", async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.isLoading).toBe(false);
    });
    test("testing status of current step", async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.status).toMatch("success");
    });
    test("testing step output", async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.stepOutput).toBe(100);
    });
    test("testing shared state", async () => {
        await act(async () => {
            await result?.current.execute()
        });
        expect(result?.current.sharedState).toEqual({});
    });
    test("testing isAllDone flag", async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.isAllDone).toBe(false);
    });
});

describe("After failed execution of a step", () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(() => {
        const { result: rs } = renderHook(({ initialStep, stepsAndHandlers }: { initialStep: number, stepsAndHandlers: StepsAndHandlersMapType }) => {
            return useStepwiseExecution(initialStep, stepsAndHandlers)
        }, {
            initialProps: {
                initialStep: 0, stepsAndHandlers: [
                    [
                        async () => {
                            throw Error("Failed");
                        }
                    ]
                ]
            }
        });
        result = rs;
        // waitForNextUpdate = wfnu;
    });

    afterEach(() => {
        result = undefined;
    });

    test("Expecting an error", async () => {
        await act(async () => {
            await result?.current.execute().catch((e: Error) => {
                expect(e).toEqual(Error("Failed"));
            });
        });
    });

    test("testing current step", async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.currentStep).toBe(0);
            });
        });
    });
    test("testing isLoading flag", async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.isLoading).toBe(false);
            });
        });
    });
    test("testing status of current step", async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.status).toMatch("error");
            });
        });
    });
    test("testing step output", async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.stepOutput).toBeUndefined();
            });
        });
    });
    test("testing shared state", async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.sharedState).toEqual({});
            })
        });
    });
    test("testing isAllDone flag", async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.isAllDone).toBe(false);
            });
        });
    });
});

describe("After all steps are executed", () => {

});