import { Card } from '@/components/Card'
import { Flex } from '@/components/Flex'
import { Flow, type FlowProps } from '@/components/Flow'

export function FlowCard(props: FlowProps) {
  return (
    <Flow
      as={Card}
      gap={5}
      borderColor="neutral.border"
      borderStyle="solid"
      borderWidth="md"
      part="card"
      {...props}
    >
      {({ handleDismiss, handlePrimary, handleSecondary, parentProps: { dismissible }, step }) => (
        <>
          <Flex.Row
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            justifyContent="space-between"
            part="card-header"
          >
            <Card.Title>{step.title}</Card.Title>
            {dismissible && <Card.Dismiss onClick={handleDismiss} />}
            <Card.Subtitle flexBasis="100%">{step.subtitle}</Card.Subtitle>
          </Flex.Row>

          <Card.Media src={step.imageUri} css={{ objectFit: 'contain', width: '100%' }} />

          <Flex.Row gap={3} justifyContent="flex-end" part="card-footer">
            <Card.Secondary title={step.secondaryButtonTitle} onClick={handleSecondary} />
            <Card.Primary title={step.primaryButtonTitle} onClick={handlePrimary} />
          </Flex.Row>
        </>
      )}
    </Flow>
  )
}
