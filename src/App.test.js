import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App initWordSetType={"wordle"} />);
  const linkElement = screen.getByText(/Helper/i);
  expect(linkElement).toBeInTheDocument();
});
