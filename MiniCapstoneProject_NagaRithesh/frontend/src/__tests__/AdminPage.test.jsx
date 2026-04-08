import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdminPage } from "../pages/AdminPage.jsx";

jest.mock("../api/adminApi.js", () => ({
  getReports: jest.fn(),
  listUsers: jest.fn(),
}));

jest.mock("../api/cdrApi.js", () => ({
  addCdr: jest.fn(),
  listMyCdr: jest.fn(),
}));

jest.mock("../api/billingApi.js", () => ({
  generateBill: jest.fn(),
  listMyBills: jest.fn(),
  payBill: jest.fn(),
}));

jest.mock("../api/planApi.js", () => ({
  createPlan: jest.fn(),
  listPlans: jest.fn(),
}));

describe("AdminPage", () => {
  test("allows typing string user ids for Add CDR and Generate bill", async () => {
    const user = userEvent.setup();
    const { getReports, listUsers } = await import("../api/adminApi.js");

    getReports.mockResolvedValue({
      total_users: 1,
      total_cdr_records: 0,
      total_revenue_paid: 0,
      total_revenue_pending: 0,
      total_bills: 0,
    });
    listUsers.mockResolvedValue([
      { id: "507f1f77bcf86cd799439011", name: "A", mobile_number: "900", role: "admin", plan_id: null },
    ]);

    render(<AdminPage />);

    await screen.findByRole("heading", { name: /admin overview/i });
    const inputs = screen.getAllByLabelText(/^user id$/i);

    const addCdrUserId = inputs[0];
    expect(addCdrUserId).toHaveAttribute("type", "text");
    await user.clear(addCdrUserId);
    await user.type(addCdrUserId, "507f1f77bcf86cd799439011");
    expect(addCdrUserId).toHaveValue("507f1f77bcf86cd799439011");

    const generateBillUserId = inputs[1];
    expect(generateBillUserId).toHaveAttribute("type", "text");
    await user.clear(generateBillUserId);
    await user.type(generateBillUserId, "507f191e810c19729de860ea");
    expect(generateBillUserId).toHaveValue("507f191e810c19729de860ea");
  });
});

