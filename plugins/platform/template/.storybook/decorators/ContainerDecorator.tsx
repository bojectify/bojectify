import type { Decorator } from '@storybook/nextjs-vite';
import { Container } from '@components/ui/layout/container';

export const ContainerDecorator: Decorator = (Story) => (
  <Container>
    <Story />
  </Container>
);
