import React, { CSSProperties, useEffect } from 'react'
import { useFlows } from '../api/flows'
import { ProgressBadge } from '../Checklists/ProgressBadge'
import { useFlowOpens } from '../api/flow-opens'

interface FrigadeProgressBadgeProps {
  flowId: string
  title: string
  className?: string
  style?: CSSProperties
  primaryColor?: string
  secondaryColor?: string
  textStyle?: CSSProperties
  onClick?: () => void
  customVariables?: { [key: string]: string | number | boolean }
}

export const FrigadeProgressBadge: React.FC<FrigadeProgressBadgeProps> = ({
  flowId,
  primaryColor,
  title,
  style,
  textStyle,
  secondaryColor,
  onClick,
  className,
  customVariables,
}) => {
  const {
    getFlow,
    getFlowSteps,
    getNumberOfStepsCompleted,
    isLoading,
    targetingLogicShouldHideFlow,
    setCustomVariable,
  } = useFlows()

  const { setOpenFlowState, getOpenFlowState } = useFlowOpens()

  useEffect(() => {
    if (!isLoading && customVariables) {
      Object.keys(customVariables).forEach((key) => {
        setCustomVariable(key, customVariables[key])
      })
    }
  }, [customVariables, isLoading])

  if (isLoading) {
    return null
  }

  const flow = getFlow(flowId)
  if (!flow) {
    return null
  }

  if (targetingLogicShouldHideFlow(flow)) {
    return null
  }

  const steps = getFlowSteps(flowId)
  const completedCount = getNumberOfStepsCompleted(flowId)

  return (
    <ProgressBadge
      count={completedCount}
      total={steps.length}
      title={title}
      style={style}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      textStyle={textStyle}
      onClick={() => {
        setOpenFlowState(flowId, true)
        if (onClick) {
          onClick()
        }
      }}
      className={className}
    />
  )
}
