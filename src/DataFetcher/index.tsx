import React, { FC, useContext, useEffect, useState } from 'react'
import { TriggerType } from '../api/flows'
import { FrigadeContext } from '../FrigadeProvider'
import { useUser } from '../api/users'
import { v4 as uuidv4 } from 'uuid'
import {
  FlowResponse,
  PublicStepState,
  PublicUserFlowState,
  useFlowResponses,
} from '../api/flow-responses'
import { FrigadeChecklist } from '../FrigadeChecklist'

interface DataFetcherProps {}

const guestUserIdField = 'xFrigade_guestUserId'

export const DataFetcher: FC<DataFetcherProps> = ({}) => {
  const { getUserFlowState, setFlowResponses } = useFlowResponses()
  const { userId, setUserId } = useUser()
  const { flows, userProperties, setIsLoading } = useContext(FrigadeContext)
  const [automaticFlowIdsToTrigger, setAutomaticFlowIdsToTrigger] = useState<string[]>([])

  async function syncFlows() {
    setIsLoading(true)
    if (flows) {
      // Prefetch flow responses for each flow in parallel
      let prefetchPromises = []
      flows.forEach((flow) => {
        prefetchPromises.push(getUserFlowState(flow.slug, userId))
      })
      const flowStates = await Promise.all(prefetchPromises)
      for (let i = 0; i < flowStates.length; i++) {
        if (flowStates[i]) {
          syncFlowStates(flowStates[i])
        }
      }
      setIsLoading(false)
    } else {
      console.error('Failed to prefetch flows')
    }
  }

  function triggerFlow(flowId: string) {
    const flow = flows.find((flow) => flow.slug === flowId)
    if (flow && flow.triggerType === TriggerType.AUTOMATIC) {
      // We only trigger one at a time
      setAutomaticFlowIdsToTrigger([flowId])
    }
  }

  function syncFlowStates(flowState: PublicUserFlowState) {
    if (flowState && flowState.stepStates && Object.keys(flowState.stepStates).length !== 0) {
      // Convert flowState.stepStates map to flowResponses
      const apiFlowResponses: FlowResponse[] = []
      for (const stepSlug in flowState.stepStates) {
        const stepState = flowState.stepStates[stepSlug] as PublicStepState
        apiFlowResponses.push({
          foreignUserId: flowState.foreignUserId,
          flowSlug: flowState.flowId,
          stepId: stepState.stepId,
          actionType: stepState.actionType,
          data: {},
          createdAt: new Date(),
        } as FlowResponse)
      }
      // merge internal flow responses with api flow responses
      setFlowResponses((responses) => [...responses, ...apiFlowResponses])
    }
    if (flowState && flowState.shouldTrigger) {
      // If the flow should be triggered, trigger it
      triggerFlow(flowState.flowId)
    }
  }

  function generateGuestUserId() {
    // If userId is null, generate a guest user id using uuid
    if (!userId) {
      // Call local storage to see if we already have a guest user id
      const guestUserId = localStorage.getItem(guestUserIdField)
      if (guestUserId) {
        setUserId(guestUserId)
        return
      }
      // If we don't have a guest user id, generate one and save it to local storage
      const newGuestUserId = 'guest_' + uuidv4()
      localStorage.setItem(guestUserIdField, newGuestUserId)
      setUserId((userId) => (userId ? userId : newGuestUserId))
    }
  }

  useEffect(() => {
    if (userId !== null) {
      generateGuestUserId()
      syncFlows()
    }
  }, [userId, flows, userProperties])

  function AutomaticFlowIdsToTrigger() {
    return (
      <>
        {automaticFlowIdsToTrigger.map((flowId) => (
          <FrigadeChecklist flowId={flowId} type={'modal'} />
        ))}
      </>
    )
  }

  return (
    <>
      <AutomaticFlowIdsToTrigger />
    </>
  )
}
