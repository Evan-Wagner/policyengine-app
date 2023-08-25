import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router, useSearchParams } from "react-router-dom";

import {
  getChildName,
  getCountChildren,
  addChild
} from "pages/household/input/CountChildren.jsx";
import { defaultHouseholds } from "api/defaultHouseholds.js";
import * as call from "api/call";
import CountChildren from "pages/household/input/CountChildren.jsx";

jest.mock("react-plotly.js", () => jest.fn());
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useSearchParams: jest.fn(),
    setSearchParams: jest.fn(),
  };
});


let metadata = {
  basicInputs: [
    "Garbage Value"
  ]
};
const autocompute = false;
const emptyFunction = () => {return};

describe("Test refactored CountChildren getChildName function", () => {
  test("Confirm that getChildName works for UK", () => {

    expect(getChildName(2, "uk")).toBe("your third child");

  });

  test("Confirm that getChildName works for US", () => {
    expect(getChildName(1, "us")).toBe("your second dependent");
  });

  test("Confirm that getChildName works for Nigeria", () => {
    expect(getChildName(3, "ng")).toBe("your fourth child");
  });

  test("Confirm that getChildName works for future countries by default (e.g., Tuvalu", () => {
    expect(getChildName(4, "tv")).toBe("your fifth child");
  });

});

describe("Test refactored CountChildren getCountChildren func", () => {
  test("Confirm that getCountChildren works for UK", () => {

    let testHousehold = JSON.parse(JSON.stringify(defaultHouseholds.uk));

    testHousehold.people["your first child"] = {
      age: {
        2023: 15
      }
    };
    testHousehold.people["your second child"] = {
      age: {
        2023: 4
      }
    };

    expect(getCountChildren(testHousehold, "uk")).toBe(2);

  });

  test("Confirm that getCountChildren works for US", () => {

    let testHousehold = JSON.parse(JSON.stringify(defaultHouseholds.us));

    testHousehold.people["your first dependent"] = {
      is_tax_unit_dependent: {
        2023: true
      }
    };

    expect(getCountChildren(testHousehold, "us")).toBe(1);

  });

});

describe("Test refactored addChild function", () => {
  test("Confirm that addChild works for UK", () => {
    let testHousehold = JSON.parse(JSON.stringify(defaultHouseholds.uk));

    const defaultChild = {
      age: { 2023: 10 },
    };
    const childCount = getCountChildren(testHousehold, "uk");
    const childName = getChildName(childCount, "uk");

    testHousehold.people[childName] = defaultChild;
    testHousehold.benunits["your immediate family"].members.push(childName);
    testHousehold.households["your household"].members.push(childName);

    expect(addChild(defaultHouseholds.uk, "uk")).toStrictEqual(testHousehold);

  });
  test("Confirm that addChild works for US", () => {

    let testHousehold = JSON.parse(JSON.stringify(defaultHouseholds.us));

    const defaultChild = {
      age: { 2023: 10 },
    };
    const childCount = getCountChildren(testHousehold, "us");
    const childName = getChildName(childCount, "us");

    testHousehold.people[childName] = defaultChild;
    testHousehold.tax_units["your tax unit"].members.push(childName);
    testHousehold.families["your family"].members.push(childName);
    testHousehold.spm_units["your household"].members.push(childName);
    testHousehold.households["your household"].members.push(childName);
    testHousehold.marital_units[`${childName}'s marital unit`] = {
      members: [childName],
      marital_unit_id: { 2023: childCount + 1 },
    };

    expect(addChild(defaultHouseholds.us, "us")).toStrictEqual(testHousehold);

  });

  test("Confirm that addChild works for Nigeria", () => {
    
    let testHousehold = JSON.parse(JSON.stringify(defaultHouseholds.ng));

    const defaultChild = {
      age: { 2023: 10 },
    };
    const childCount = getCountChildren(testHousehold, "ng");
    const childName = getChildName(childCount, "ng");

    testHousehold.people[childName] = defaultChild;
    testHousehold.households["your household"].members.push(childName);

    expect(addChild(defaultHouseholds.ng, "ng")).toStrictEqual(testHousehold);
  });
});

describe("Test rendered CountChildren component", () => {
  test("Should function correctly for UK", () => {
    useSearchParams.mockImplementation(() => {
      const get = (param) => {
        if (param === "focus") {
          return "input.household.children";
        }
      };
      return [{ get }];
    });

    call.copySearchParams = jest.fn(() => {
      const returnVal = new URLSearchParams();
      returnVal.set('foo', 'bar');
      return returnVal;
    })

    const householdInput = JSON.parse(JSON.stringify(defaultHouseholds.uk));

    const testObject = {
      "people": {
        "you": {},
        "your first child": {
          "age": {
            "2023": 10
          }
        },
        "your second child": {
          "age": {
            "2023": 10
          }
        }
      },
      "benunits": {
        "your immediate family": {
          "members": [
            "you",
            "your first child",
            "your second child"
          ],
        }
      },
      "households": {
        "your household": {
          "members": [
            "you",
            "your first child",
            "your second child"
          ]
        }
      }
    }

    metadata = {
      ...metadata,
      countryId: "uk"
    };

    render(
      <Router>
        <CountChildren
          metadata={metadata}
          autocompute={autocompute}
          householdInput={householdInput}
          setHouseholdInput={emptyFunction}
        />
      </Router>
    );
    
    const buttonTwo = screen.getByText("2");

    fireEvent.click(buttonTwo);
    expect(householdInput).toStrictEqual(testObject);
    
  });
});