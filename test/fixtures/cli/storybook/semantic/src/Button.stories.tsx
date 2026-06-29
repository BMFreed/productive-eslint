import type { Meta, StoryObj } from '@storybook/react-vite'
import { renderToCanvas } from 'storybook/internal/csf'

const Button = () => <button type="button">Click</button>

const meta = {
  component: Button,
  title: 'Atoms/Button',
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: renderToCanvas,
}
