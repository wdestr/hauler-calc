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
    const els = screen.getAllByText(/revenue/i);
    expect(els.length).toBeGreaterThan(0);
  });
  it('shows net income metric tile', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('result-net')).toBeInTheDocument();
  });
  it('toggles between per-stop and flat revenue modes', () => {
    render(<Wrapper />);
    const flatBtns = screen.getAllByRole('button', { name: /flat daily/i });
    fireEvent.click(flatBtns[0]); // Click the first "Flat Daily" button (Revenue card)
    expect(screen.getByLabelText(/daily revenue/i)).toBeInTheDocument();
  });
});
