[use-stepwise-execution](README.md) / Exports

# use-stepwise-execution

## Table of contents

### Type aliases

- [SettersType](modules.md#setterstype)
- [StepExecutionStatus](modules.md#stepexecutionstatus)
- [StepHandlerType](modules.md#stephandlertype)
- [StepType](modules.md#steptype)
- [StepsAndHandlersType](modules.md#stepsandhandlerstype)

### Functions

- [useStepwiseExecution](modules.md#usestepwiseexecution)

## Type aliases

### SettersType

Ƭ **SettersType**: `Object`

These setters are not recommended for consumer
and are being used in the internal working of this hook.

But if you know what you are doing then you can have
full control over this hook and its functionality using
these setters.

CAUTION: Do not use these if you are not sure. because
these setters will change the behavior of the step
wise execution

#### Type declaration

| Name | Type |
| :------ | :------ |
| `setCurrentStepAndReset` | (`step`: `number`) => `void` |
| `setCurrentStepOnly` | (`step`: `number`) => `void` |
| `setIsAllDone` | `Dispatch`<`SetStateAction`<`boolean`\>\> |
| `setSharedState` | `Dispatch`<`SetStateAction`<`any`\>\> |
| `setStatus` | `Dispatch`<`SetStateAction`<[`StepExecutionStatus`](modules.md#stepexecutionstatus)\>\> |
| `setStepOutput` | `Dispatch`<`SetStateAction`<`any`\>\> |
| `setStepsAndHandlers` | `Dispatch`<`SetStateAction`<[`StepsAndHandlersType`](modules.md#stepsandhandlerstype)\>\> |

#### Defined in

[index.tsx:406](https://github.com/mukarramishaq/use-stepwise-execution/blob/4a2151a/src/index.tsx#L406)

___

### StepExecutionStatus

Ƭ **StepExecutionStatus**: ``"notstarted"`` \| ``"inprogress"`` \| ``"success"`` \| ``"error"``

every step will have one the following status showing
where its execution is

#### Defined in

[index.tsx:387](https://github.com/mukarramishaq/use-stepwise-execution/blob/4a2151a/src/index.tsx#L387)

___

### StepHandlerType

Ƭ **StepHandlerType**: (`data`: `any`, `sharedState`: `any`, `setSharedState`: `React.Dispatch`<`any`\>) => `Promise`<`any`\>

#### Type declaration

▸ (`data`, `sharedState`, `setSharedState`): `Promise`<`any`\>

Interface of a step handler function

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `sharedState` | `any` |
| `setSharedState` | `React.Dispatch`<`any`\> |

##### Returns

`Promise`<`any`\>

#### Defined in

[index.tsx:331](https://github.com/mukarramishaq/use-stepwise-execution/blob/4a2151a/src/index.tsx#L331)

___

### StepType

Ƭ **StepType**: [`StepHandlerType`](modules.md#stephandlertype)[]

Interface of a step

#### Defined in

[index.tsx:340](https://github.com/mukarramishaq/use-stepwise-execution/blob/4a2151a/src/index.tsx#L340)

___

### StepsAndHandlersType

Ƭ **StepsAndHandlersType**: [`StepType`](modules.md#steptype)[]

this is the actual interface of defining steps and their handlers
our useStepwiseExecution hook accept this interface to register all
steps and their handlers

*<Note:> each index in the main array is a step where are all
elements in the child array of handlers of that step</Note:>

*<Note:> output of first step will be input of next handler. The
second parameter is shared state which can be accessed. The
third parameter is shared state setter. Through which you can
update the shared state between all handlers of all step</Note:>

*<Note:> if you want to break the loop of handlers then
just throw an error because otherwise a step will be
considered complete when its all handlers run successfully
without any error</Note:>

*<Note:> all the handlers must be async of return promise</Note:>

e.g
```typescript
 const StepHandlers: StepsAndHandlersMapType = [

      [
         //handlers of this step
      ], //first step

      [
         //handlers of this step
      ], //second step

      [
         //handlers of this step
      ], //third step
 ];
```

#### Defined in

[index.tsx:381](https://github.com/mukarramishaq/use-stepwise-execution/blob/4a2151a/src/index.tsx#L381)

## Functions

### useStepwiseExecution

▸ `Const` **useStepwiseExecution**(`stepsHandlers`, `initialStep?`): `Object`

main hook which will give you the functionality
to execute your logic in steps

Usage Example:
```typescript
const startStep = 0;
const stepsAndHandlers = [
     [
         (previousOutput, state, setState) => { return newOutput;},
         (previousOutput, state, setState) => { return newOutput2;}
     ], //first step and their handlers

     [
         (previousOutput, state, setState) => { return newOutput;},
         (previousOutput, state, setState) => { return newOutput2;}
     ] //second step and their handlers
];
const {
     currentStep,
     execute,
     isCompleted,
     isSuccess,
     isLoading,
     next,
     isAllDone
} = useStepwiseExecution(stepsAndHandlers, startStep);
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `stepsHandlers` | [`StepsAndHandlersType`](modules.md#stepsandhandlerstype) | `undefined` | an array of steps and their handlers. this will |
| `initialStep` | `number` | `0` | execution will start from this step set how many steps are there |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `currentStep` | `number` |
| `execute` | (`force`: `any`) => `Promise`<`any`\> |
| `isAllDone` | `boolean` |
| `isLoading` | `boolean` |
| `moveToStep` | (`step`: `number`) => `void` |
| `next` | (`force`: `any`) => `void` |
| `setters` | [`SettersType`](modules.md#setterstype) |
| `sharedState` | `any` |
| `status` | [`StepExecutionStatus`](modules.md#stepexecutionstatus) |
| `stepOutput` | `any` |
| `stepsAndHandlers` | [`StepsAndHandlersType`](modules.md#stepsandhandlerstype) |
| `updateSharedState` | `Dispatch`<`any`\> |

#### Defined in

[index.tsx:36](https://github.com/mukarramishaq/use-stepwise-execution/blob/4a2151a/src/index.tsx#L36)
