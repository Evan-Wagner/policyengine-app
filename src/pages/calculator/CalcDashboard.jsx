import { useState } from "react";
import {
  AddButton,
  RemoveButton,
  ToggleEditSaveButton
} from "./buttons";
import {
  DollarOutlined,
  GlobalOutlined,
  HomeOutlined,
  HourglassOutlined,
  PushpinOutlined,
  UserOutlined
} from "@ant-design/icons";

const HouseholdInput = (props) => {
  const label = Object.keys(props.obj)[0];
  const key = Object.keys(props.obj[label])[0];

  const handleChange = (e) => {
    label === "dependent"
      ? props.setTempHousehold({
          ...props.tempHousehold,
          dependents: props.tempHousehold.dependents.map((d, i) => {
            return i === props.obj[label].index ? {...d, [key]: e.target.value}: d;
          })
        })
      : props.setTempHousehold({
          ...props.tempHousehold,
          [label]: {...props.tempHousehold[label], [key]: e.target.value}
        })
  }

  return (
    <input
      style={{maxWidth: "1.2in",}}
      value={props.obj[label][key]}
      onChange={(e) => handleChange(e)}
    />    
  );
}

const HouseholdRegionSelect = (props) => {
  return (
    <select
      value={props.tempHousehold.region.value}
      onChange={(e) => (props.setTempHousehold({
        ...props.tempHousehold,
        region: {
          value: e.target.value,
          label: e.target.selectedOptions[0].label
        }
      }))}
    >
      <option value="none">--</option>
      <option value="alabama">Alabama</option>
      <option value="wisconsin">Wisconsin</option>
      <option value="wyoming">Wyoming</option>
    </select>
  );
}

const CalcPanel = (props) => {
  return (
      <div
          style={{
              padding: "5px",
              flex: 1,
              border: "solid 1px black",
          }}
      >
          <b>{props.title}</b><br />
          {props.children}
      </div>
  );
}

const HeadPanel = (props) => {
  return (
    <div
      style={{
        borderRight: "1px solid black",
        paddingRight: "5px",
      }}
    >
      <b>Head</b><br />
      {props.isEditing ? <>
      <HouseholdInput
        obj={{head: {age: props.tempHousehold.head.age}}}
        tempHousehold={props.tempHousehold}
        setTempHousehold={props.setTempHousehold}
      /><br />
      <HouseholdInput
        obj={{head: {income: props.tempHousehold.head.income}}}
        tempHousehold={props.tempHousehold}
        setTempHousehold={props.setTempHousehold}
      />
      </> : <>
        {props.tempHousehold.head.age}y<br />
        {props.tempHousehold.head.income}
      </>}
    </div>
  );
}

const SpousePanel = (props) => {
  const addSpouse = () => {
    props.setTempHousehold({...props.tempHousehold, spouse: {age: 0, income: 0}})
  }

  const removeSpouse = () => {
    props.setTempHousehold({...props.tempHousehold, spouse: null});
  }

  return (
    props.tempHousehold.spouse ? <div
      style={{
        borderRight: "1px solid black",
        paddingRight: "5px",
      }}
    >
      <b>Spouse </b>
      {props.isEditing
        ? <RemoveButton
            id={-1}
            remove={removeSpouse}
          />
        : null
      }
      <br />
      {props.isEditing ? <>
        <HouseholdInput
          obj={{spouse: {age: props.tempHousehold.spouse.age}}}
          tempHousehold={props.tempHousehold}
          setTempHousehold={props.setTempHousehold}
        /><br />
        <HouseholdInput
          obj={{spouse: {income: props.tempHousehold.spouse.income}}}
          tempHousehold={props.tempHousehold}
          setTempHousehold={props.setTempHousehold}
        />
      </> : <>
        {props.tempHousehold.spouse.age}y<br />
        {props.tempHousehold.spouse.income}
      </>}
    </div> : props.isEditing ? <div>
      <AddButton
        label={'Spouse'}
        add={addSpouse}
      />
    </div> : null
  );
}

const DependentsPanel = (props) => {
  const addDependent = () => {
    props.setTempHousehold({...props.tempHousehold, dependents: props.tempHousehold.dependents.concat({age: 0, income: 0})})
  }

  const removeDependent = (index) => {
    props.setTempHousehold({...props.tempHousehold, dependents: props.tempHousehold.dependents.filter((_, i) => i !== index)});
  }

  return (
    <div>
      {props.tempHousehold.dependents.length > 0 ? <b>Dependents </b> : null}
      {props.isEditing
        ? <AddButton
            label={props.tempHousehold.dependents.length > 0 ? "" : "Dependents"}
            add={addDependent}
          />
        : null
      }
      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <br />
        {props.tempHousehold.dependents.map((dependent, index) => (
          <div
            key={index}
            style={{
              borderRight: "1px solid black",
              paddingRight: "5px",
            }}
          >
            {props.isEditing ? <>
              <RemoveButton
                id={index}
                remove={removeDependent}
              />
              <br />
              <HouseholdInput
                obj={{dependent: {age: props.tempHousehold.dependents[index].age, index: index}}}
                tempHousehold={props.tempHousehold}
                setTempHousehold={props.setTempHousehold}
              />
              <br />
              <HouseholdInput
                obj={{dependent: {income: props.tempHousehold.dependents[index].income, index: index}}}
                tempHousehold={props.tempHousehold}
                setTempHousehold={props.setTempHousehold}
              />
            </> : <>
              {dependent.age}y<br />
              {dependent.income}
            </>}
          </div>
        ))}
      </div>
    </div>
  )
}

const HouseholdPanel = (props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempHousehold, setTempHousehold] = useState(props.household);

    const editHousehold = () => {
        setTempHousehold(props.household);
        setIsEditing(true);
    }

    const saveHousehold = () => {
        props.setHousehold(tempHousehold);
        setIsEditing(false);
    }

    return (
        <div
            style={{
                padding: "5px",
                flex: 3,
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                border: "solid 1px black",
                minWidth: 0,
            }}
        >
            <div
                style={{
                    minWidth: "fit-content",
                }}
            >
            <b>Household</b>
            <br />
            <PushpinOutlined />
            {isEditing
                ?   <HouseholdRegionSelect
                        tempHousehold={tempHousehold}
                        setTempHousehold={setTempHousehold}
                    />
                :   <span> 
                        {' '+props.household.region.label}
                    </span>
            }
            <br />
            <ToggleEditSaveButton
              isEditing={isEditing}
              edit={editHousehold}
              save={saveHousehold}
            />
          </div>
          <div
            style={{
              borderRight: "1px solid black",
              paddingRight: "5px",
            }}
          >
            <UserOutlined /><br />
            <HourglassOutlined /><br />
            <DollarOutlined />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              overflow: "hidden",
              overflowX: "auto",
              minWidth: 0,
            }}
          >
            <HeadPanel
              isEditing={isEditing}
              tempHousehold={tempHousehold}
              setTempHousehold={setTempHousehold}
            />
            <SpousePanel
              isEditing={isEditing}
              tempHousehold={tempHousehold}
              setTempHousehold={setTempHousehold}
            />
            <DependentsPanel
              isEditing={isEditing}
              tempHousehold={tempHousehold}
              setTempHousehold={setTempHousehold}
            />
          </div>
        </div>
    );
}

export default function CalcDashboard(props) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          padding: "10px",
          overflow: "hidden",
          overflowX: "scroll",
          backgroundColor: "lightgray",
        }}
      >
        <button
          style={{
            minWidth: "72px",
          }}
          onClick={() => props.setIsInHouseholdMode(!props.isInHouseholdMode)}
        >
          {props.isInHouseholdMode ? <HomeOutlined /> : <GlobalOutlined />}
        </button>
        <CalcPanel title="Metric">
          <select
            value={props.calcSettings.metric}
            style={{width: "100%",}}
            onChange={(e) => props.setCalcSettings({...props.calcSettings, metric: e.target.value})}
          >
            <option value="none">--</option>
            {props.isInHouseholdMode ? <>
              <option value="netIncome">Net income</option>
              <option value="earningsVariation">Earnings variation</option>
              <option value="marginalTaxRate">Marginal tax rate</option>
            </> : <>
              <option value="budgetaryImpact">Budgetary impact</option>
              <option value="outcomes">Outcomes</option>
              <option value="netIncomeAbsolute">Net income (absolute)</option>
              <option value="netIncomeRelative">Net income (relative)</option>
              <option value="cliffImpact">Net income cliffs</option>
              <option value="povertyImpact">Poverty rate</option>
              <option value="deepPovertyImpact">Deep poverty rate</option>
              <option value="incomeInequalityImpact">Income inequality</option>
            </>}
          </select>
        </CalcPanel>
        {props.isInHouseholdMode ? <HouseholdPanel 
          household={props.household}
          setHousehold={props.setHousehold}
          setIsInHouseholdMode={props.setIsInHouseholdMode}
        /> : <>
          <CalcPanel title="Grouping">
            <select
              value={props.calcSettings.metric === "budgetaryImpact" ? "none" : props.calcSettings.grouping}
              disabled={["none", "budgetaryImpact", "cliffImpact"].includes(props.calcSettings.metric)}
              style={{width: "100%",}}
              onChange={(e) => props.setCalcSettings({...props.calcSettings, grouping: e.target.value})}
            >
              <option value="none">--</option>
              <option value="byAge">By age</option>
              <option value="bySex">By sex</option>
              <option value="byRace">By race</option>
              <option value="byIncomeLevel">By income level</option>
            </select>
          </CalcPanel>
          <CalcPanel title="Region">
            <select
              value={props.calcSettings.metric === "budgetaryImpact" ? "none" : props.calcSettings.region}
              disabled={["none", "budgetaryImpact", "cliffImpact"].includes(props.calcSettings.metric)}
              style={{width: "100%",}}
              onChange={(e) => props.setCalcSettings({...props.calcSettings, region: e.target.value})}
            >
              <option value="none">--</option>
              <option value="alabama">Alabama</option>
              <option value="wyoming">Wyoming</option>
            </select>
          </CalcPanel>
          <CalcPanel title="Time Period">
            <input
              style={{
                maxWidth: "48px",
              }}
              value={props.calcSettings.startTime}
              onChange={(e) => props.setCalcSettings({...props.calcSettings, startTime: e.target.value})}
            ></input>
            <span>  to  </span>
            <input
              style={{
                maxWidth: "48px",
              }}
              value={props.calcSettings.endTime}
              onChange={(e) => props.setCalcSettings({...props.calcSettings, endTime: e.target.value})}
            ></input>
          </CalcPanel>
        </>}
      </div>
    );
}