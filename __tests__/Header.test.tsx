import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { DashboardHeader } from "@/components/dashboard/header";

describe("PricingCards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders DashboardHeader correctly", () => {
    render(
      <DashboardHeader heading="Heading" text="Text">
        <div>Children</div>
      </DashboardHeader>,
    );

    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();
  });
});

// it('renders sign in buttons when user is not logged in', () => {
//   render(
//     <ModalContext.Provider value={{ setShowSignInModal: mockSetShowSignInModal }}>
//       <PricingCards />
//     </ModalContext.Provider>
//   );

//   const signInButtons = screen.getAllByText('Sign in');
//   expect(signInButtons).toHaveLength(2);

//   // Click on a sign in button and check if the modal is triggered
//   signInButtons[0].click();
//   expect(mockSetShowSignInModal).toHaveBeenCalledWith(true);
// });
