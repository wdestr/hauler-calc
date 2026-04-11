import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '@/components/calculator/Calculator';
import { DEFAULTS } from '@/lib/defaults';
import { useState } from 'react';
import type { CalcInputs } from '@/types';

function Wrapper() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULTS);
  return <Calculator inputs={inputs} onInputsChange={setInputs} />;
}

describe('Calculator', () => {
  it('renders revenue section', () => {
    render(<Wrapper />);
    expect(screen.getByText(/revenue/i)).toBeInTheDocument();
  });
  it('shows net income metric tile', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('result-net')).toBeInTheDocument();
  });
  it('toggles between per-stop and flat revenue modes', () => {
    render(<Wrapper />);
    const flatBtn = screen.getByRole('button', { name: /flat daily/i });
    fireEvent.click(flatBtn);
    expect(screen.getByLabelText(/daily revenue/i)).toBeInTheDocument();
  });
});
