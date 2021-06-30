import { renderHook, act, RenderResult, WaitForNextUpdate } from '@testing-library/react-hooks';
import { useStepwiseExecution, StepsAndHandlersType } from '../src';

describe('Initialization of the hook', () => {
    const { result } = renderHook(
        ({
            stepsAndHandlers,
        }: {
            stepsAndHandlers: StepsAndHandlersType;
        }) => {
            return useStepwiseExecution(stepsAndHandlers);
        },
        { initialProps: {stepsAndHandlers: [] } }
    );
    test('testing return data from hook first call', async () => {
        expect(result.current.currentStep).toBe(0);
        expect(result.current.isAllDone).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.status).toBe('notstarted');
        expect(result.current.stepOutput).toBeUndefined();
        expect(result.current.sharedState).toEqual({});
    });
});

describe('Before executing a step', () => {
    const { result } = renderHook(
        ({
            initialStep,
            stepsAndHandlers,
        }: {
            initialStep: number;
            stepsAndHandlers: StepsAndHandlersType;
        }) => {
            return useStepwiseExecution(stepsAndHandlers, initialStep);
        },
        { initialProps: { initialStep: 0, stepsAndHandlers: [] } }
    );
    test('testing current step', async () => {
        expect(result.current.currentStep).toBe(0);
    });
    test('testing current step', async () => {
        expect(result.current.isLoading).toBe(false);
    });
    test('testing status of current step', async () => {
        expect(result.current.status).toBe('notstarted');
    });
    test('testing step output', async () => {
        expect(result.current.stepOutput).toBeUndefined();
    });
    test('testing shared state', async () => {
        expect(result.current.sharedState).toEqual({});
    });
    test('testing isAllDone flag', async () => {
        expect(result.current.isAllDone).toBe(false);
    });
    test('testing setting shared state', async () => {
        const { result } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            { initialProps: { initialStep: 0, stepsAndHandlers: [] } }
        );
        act(() => {
            result.current.updateSharedState(() => 'hello');
        });
        expect(result.current.sharedState).toBe('hello');
    });
});

describe('While executing a step', () => {
    let result: RenderResult<any> | undefined;
    let waitForNextUpdate: WaitForNextUpdate;

    beforeEach(async () => {
        const { result: rs, waitForNextUpdate: wfnu } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async () => {
                                return await new Promise(res =>
                                    setTimeout(() => res(1), 200)
                                );
                            },
                        ],
                    ],
                },
            }
        );
        result = rs;
        waitForNextUpdate = wfnu;
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing current step', async () => {
        await act(async () => {
            const prm = result?.current.execute();
            await waitForNextUpdate();
            expect(result?.current.currentStep).toBe(0);
            return await prm;
        });
    });
    test('testing isLoading flag', async () => {
        await act(async () => {
            const prm = result?.current.execute();
            await waitForNextUpdate();
            expect(result?.current.isLoading).toBe(true);
            return await prm;
        });
    });
    test('testing status of current step', async () => {
        await act(async () => {
            const prm = result?.current.execute();
            await waitForNextUpdate();
            expect(result?.current.status).toBe('inprogress');
            return await prm;
        });
    });
    test('testing step output', async () => {
        await act(async () => {
            const prm = result?.current.execute();
            await waitForNextUpdate();
            expect(result?.current.stepOutput).toBeUndefined();
            return await prm;
        });
    });
    test('testing shared state', async () => {
        await act(async () => {
            const prm = result?.current.execute();
            await waitForNextUpdate();
            expect(result?.current.sharedState).toEqual({});
            return await prm;
        });
    });
    test('testing isAllDone flag', async () => {
        await act(async () => {
            const prm = result?.current.execute();
            await waitForNextUpdate();
            expect(result?.current.isAllDone).toBe(false);
            return await prm;
        });
    });
});

describe('After successful execution of a step', () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(() => {
        const { result: rs } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async () => {
                                return 100;
                            },
                        ],
                    ],
                },
            }
        );
        result = rs;
        // waitForNextUpdate = wfnu;
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing current step', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.currentStep).toBe(0);
    });
    test('testing isLoading flag', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing status of current step', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.status).toBe('success');
    });
    test('testing step output', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.stepOutput).toBe(100);
    });
    test('testing shared state', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.sharedState).toEqual({});
    });
    test('testing isAllDone flag', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.isAllDone).toBe(false);
    });
});

describe('After failed execution of a step', () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(() => {
        const { result: rs } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async () => {
                                throw Error('Failed');
                            },
                        ],
                    ],
                },
            }
        );
        result = rs;
        // waitForNextUpdate = wfnu;
    });

    afterEach(() => {
        result = undefined;
    });

    test('Expecting an error', async () => {
        await act(async () => {
            await result?.current.execute().catch((e: Error) => {
                expect(e).toEqual(Error('Failed'));
            });
        });
    });

    test('testing current step', async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.currentStep).toBe(0);
            });
        });
    });
    test('testing isLoading flag', async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.isLoading).toBe(false);
            });
        });
    });
    test('testing status of current step', async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.status).toBe('error');
            });
        });
    });
    test('testing step output', async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.stepOutput).toBeUndefined();
            });
        });
    });
    test('testing shared state', async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.sharedState).toEqual({});
            });
        });
    });
    test('testing isAllDone flag', async () => {
        await act(async () => {
            await result?.current.execute().catch(() => {
                expect(result?.current.isAllDone).toBe(false);
            });
        });
    });
});

describe('After all steps are executed', () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('10');
                                    return st;
                                });
                                return '10';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('11');
                                    return st;
                                });
                                return po + '11';
                            },
                        ], //first step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('20');
                                    return st;
                                });
                                return po + '20';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('21');
                                    return st;
                                });
                                return po + '21';
                            },
                        ], //second step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('30');
                                    return st;
                                });
                                return po + '30';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('31');
                                    return st;
                                });
                                return po + '31';
                            },
                        ], //third step and its handlers
                    ],
                },
            }
        );
        result = rs;
        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });

        await act(async () => {
            await result?.current.execute().then(() => {
                result?.current.next();
            });
        });
        await act(async () => {
            await result?.current.execute().then(() => {
                result?.current.next();
            });
        });
        await act(async () => {
            await result?.current.execute().then(() => {
                result?.current.next();
            });
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing current step', async () => {
        expect(result?.current.currentStep).toBe(2);
    });
    test('testing isLoading flag', async () => {
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing status of current step', async () => {
        expect(result?.current.status).toBe('success');
    });
    test('testing Final output', async () => {
        expect(result?.current.stepOutput).toBe('101120213031');
    });
    test('testing shared state', async () => {
        expect(result?.current.sharedState).toEqual([
            '10',
            '11',
            '20',
            '21',
            '30',
            '31',
        ]);
    });
    test('testing isAllDone flag', async () => {
        expect(result?.current.isAllDone).toBe(true);
    });
});

describe('After Jumping to specific step', () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('10');
                                    return st;
                                });
                                return '10';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('11');
                                    return st;
                                });
                                return po + '11';
                            },
                        ], //first step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('20');
                                    return st;
                                });
                                return po + '20';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('21');
                                    return st;
                                });
                                return po + '21';
                            },
                        ], //second step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('30');
                                    return st;
                                });
                                return po + '30';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('31');
                                    return st;
                                });
                                return po + '31';
                            },
                        ], //third step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('40');
                                    return st;
                                });
                                return po + '40';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('41');
                                    return st;
                                });
                                return po + '41';
                            },
                        ], //forth step and its handlers
                    ],
                },
            }
        );
        result = rs;
        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });

        await act(async () => {
            await result?.current.execute().then(() => {
                result?.current.moveToStep(2);
            });
        });
        await act(async () => {
            await result?.current.execute();
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing current step', async () => {
        expect(result?.current.currentStep).toBe(2);
    });
    test('testing isLoading flag', async () => {
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing status of current step', async () => {
        expect(result?.current.status).toBe('success');
    });
    test('testing Final output', async () => {
        expect(result?.current.stepOutput).toBe('10113031');
    });
    test('testing shared state', async () => {
        expect(result?.current.sharedState).toEqual(['10', '11', '30', '31']);
    });
    test('testing isAllDone flag', async () => {
        expect(result?.current.isAllDone).toBe(false);
    });
});

describe('Executing when 0 steps and handlers given', () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [],
                },
            }
        );
        result = rs;
        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });

        await act(async () => {
            await result?.current.execute();
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing current step', async () => {
        expect(result?.current.currentStep).toBe(0);
    });
    test('testing isLoading flag', async () => {
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing status of current step', async () => {
        expect(result?.current.status).toBe('notstarted');
    });
    test('testing Final output', async () => {
        expect(result?.current.stepOutput).toBeUndefined();
    });
    test('testing shared state', async () => {
        expect(result?.current.sharedState).toEqual([]);
    });
    test('testing isAllDone flag', async () => {
        expect(result?.current.isAllDone).toBe(false);
    });
});

describe('Testing Execute function', () => {
    let result: RenderResult<any> | undefined;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('10');
                                    return st;
                                });
                                return po + '10';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('11');
                                    return st;
                                });
                                return po + '11';
                            },
                        ], //first step and its handlers
                    ],
                },
            }
        );
        result = rs;
        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing first execute without force param', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.currentStep).toBe(0);
        expect(result?.current.sharedState).toEqual(['10', '11']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBe('undefined1011');
        expect(result?.current.status).toBe('success');
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing first execute with force param', async () => {
        await act(async () => {
            await result?.current.execute(true); //force executing again
        });
        expect(result?.current.currentStep).toBe(0);
        expect(result?.current.sharedState).toEqual(['10', '11']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBe('undefined1011');
        expect(result?.current.status).toBe('success');
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing Rerunning execute without force param', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        await act(async () => {
            await result?.current.execute();
        });
        expect(result?.current.currentStep).toBe(0);
        expect(result?.current.sharedState).toEqual(['10', '11']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBe('undefined1011');
        expect(result?.current.status).toBe('success');
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing Rerunning execute with force param', async () => {
        await act(async () => {
            await result?.current.execute();
        });
        await act(async () => {
            await result?.current.execute(true);
        });
        expect(result?.current.currentStep).toBe(0);
        expect(result?.current.sharedState).toEqual(['10', '11', '10', '11']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBe('undefined10111011');
        expect(result?.current.status).toBe('success');
        expect(result?.current.isLoading).toBe(false);
    });
});


describe('Testing next function when current step is successfully executed', () => {
    let result: RenderResult<any> | undefined;
    let waitForNextUpdate: WaitForNextUpdate;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs, waitForNextUpdate: wfnu } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('10');
                                    return st;
                                });
                                return po + '10';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('11');
                                    return st;
                                });
                                return po + '11';
                            },
                        ], //first step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('20');
                                    return st;
                                });
                                return po + '20';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('21');
                                    return st;
                                });
                                return po + '21';
                            },
                        ], //second step and its handlers
                    ],
                },
            }
        );
        result = rs;
        waitForNextUpdate = wfnu;
        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });
        await act(async () => {
            await result?.current.execute();
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing next without force param', async () => {
        act(() => {
            result?.current.next();
        });
        waitForNextUpdate();
        expect(result?.current.currentStep).toBe(1);
        expect(result?.current.sharedState).toEqual(['10', '11']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBe('undefined1011');
        expect(result?.current.status).toBe('notstarted');
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing next with force param', async () => {
        act(() => {
            result?.current.next(true);
        });
        waitForNextUpdate();
        expect(result?.current.currentStep).toBe(1);
        expect(result?.current.sharedState).toEqual(['10', '11']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBe('undefined1011');
        expect(result?.current.status).toBe('notstarted');
        expect(result?.current.isLoading).toBe(false);
    });
});

describe('Testing next function when current step is failed', () => {
    let result: RenderResult<any> | undefined;
    let waitForNextUpdate: WaitForNextUpdate;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs, waitForNextUpdate: wfnu } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('10');
                                    return st;
                                });
                                return po + '10';
                            },
                            async (po, st, setSharedState) => {
                                throw new Error("Failed")
                            },
                        ], //first step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('20');
                                    return st;
                                });
                                return po + '20';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('21');
                                    return st;
                                });
                                return po + '21';
                            },
                        ], //second step and its handlers
                    ],
                },
            }
        );
        result = rs;
        waitForNextUpdate = wfnu;
        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });
        await act(async () => {
            await result?.current.execute().catch(() => {});
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing next without force param', async () => {
        act(() => {
            result?.current.next();
        });
        waitForNextUpdate();
        expect(result?.current.currentStep).toBe(0);
        expect(result?.current.sharedState).toEqual(['10']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBeUndefined();
        expect(result?.current.status).toBe('error');
        expect(result?.current.isLoading).toBe(false);
    });
    test('testing next with force param', async () => {
        act(() => {
            result?.current.next(true);
        });
        waitForNextUpdate();
        expect(result?.current.currentStep).toBe(1);
        expect(result?.current.sharedState).toEqual(['10']);
        expect(result?.current.isAllDone).toBe(false);
        expect(result?.current.stepOutput).toBeUndefined();
        expect(result?.current.status).toBe('notstarted');
        expect(result?.current.isLoading).toBe(false);
    });
});


describe('Setters Tesing', () => {
    let result: RenderResult<any> | undefined;
    let waitForNextUpdate: WaitForNextUpdate;
    // let waitForNextUpdate: WaitForNextUpdate | undefined;
    beforeEach(async () => {
        const { result: rs, waitForNextUpdate: wfnu } = renderHook(
            ({
                initialStep,
                stepsAndHandlers,
            }: {
                initialStep: number;
                stepsAndHandlers: StepsAndHandlersType;
            }) => {
                return useStepwiseExecution(stepsAndHandlers, initialStep);
            },
            {
                initialProps: {
                    initialStep: 0,
                    stepsAndHandlers: [
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('10');
                                    return st;
                                });
                                return '10';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('11');
                                    return st;
                                });
                                return po + '11';
                            },
                        ], //first step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('20');
                                    return st;
                                });
                                return po + '20';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('21');
                                    return st;
                                });
                                return po + '21';
                            },
                        ], //second step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('30');
                                    return st;
                                });
                                return po + '30';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('31');
                                    return st;
                                });
                                return po + '31';
                            },
                        ], //third step and its handlers
                        [
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('40');
                                    return st;
                                });
                                return po + '40';
                            },
                            async (po, st, setSharedState) => {
                                setSharedState((st: Array<string>) => {
                                    st.push('41');
                                    return st;
                                });
                                return po + '41';
                            },
                        ], //forth step and its handlers
                    ],
                },
            }
        );
        result = rs;
        waitForNextUpdate = wfnu;

        act(() => {
            result?.current.updateSharedState(() => []); //set empty array for shared state
        });

        await act(async () => {
            await result?.current.execute().then(() => {
                result?.current.moveToStep(2);
            });
        });
        await act(async () => {
            await result?.current.execute();
        });
    });

    afterEach(() => {
        result = undefined;
    });

    test('testing setCurrentStepOnly', async() => {
        await act(async () => {
            result?.current.setters.setCurrentStepOnly(1);
            await waitForNextUpdate();
            expect(result?.current.currentStep).toBe(1);
            expect(result?.current.isLoading).toBe(false);
            expect(result?.current.status).toBe("success");
            expect(result?.current.stepOutput).toBe('10113031');
            expect(result?.current.sharedState).toEqual(['10', '11', '30', '31']);
            expect(result?.current.isAllDone).toBe(false);
        });
    });
    
});