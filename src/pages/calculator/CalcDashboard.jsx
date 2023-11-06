import { useState } from "react";
import {
  AddButton,
  RemoveButton,
  ToggleEditSaveButton,
  ToggleHouseholdModeButton
} from "./controls";
import {
  DollarOutlined,
  HourglassOutlined,
  PushpinOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Input,
  Select
} from "antd";

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

const MetricPanel = (props) => {
  const options = props.inInHouseholdMode
    ? [
        {value: "none", label: "--"},
        {value: "netIncome", label: "Net income"},
        {value: "earningsVariation", label: "Earnings variation"},
        {value: "marginalTaxRate", label: "Marginal tax rate"}
    ]
    : [
        {value: "none", label: "--"},
        {value: "budgetary", label: "Budgetary impact"},
        {value: "outcomes", label: "Outcomes"},
        {value: "netIncomeAbsolute", label: "Net income (absolute)"},
        {value: "netIncomeRelative", label: "Net income (relative)"},
        {value: "cliff", label: "Net income cliffs"},
        {value: "poverty", label: "Poverty rate"},
        {value: "deepPoverty", label: "Deep poverty rate"},
        {value: "incomeInequality", label: "Income inequality"},
    ];

  return (
    <CalcPanel title="Metric">
      <Select
        options={options}
        defaultValue={props.calcSettings.metric}
        style={{width: "100%",}}
        onSelect={(value) => props.setCalcSettings({...props.calcSettings, metric: value})}
      />
    </CalcPanel>
  )
}

const GroupingPanel = (props) => {
  const options = [
        {value: "none", label: "--"},
        {value: "byAge", label: "By age"},
        {value: "bySex", label: "By sex"},
        {value: "byRace", label: "By race"},
        {value: "byIncomeLevel", label: "By income level"},
    ];

  return (
    <CalcPanel title="Grouping">
      <Select
        options={options}
        defaultValue={props.calcSettings.metric === "budgetary" ? "none" : props.calcSettings.grouping}
        disabled={["none", "budgetary", "cliff"].includes(props.calcSettings.metric)}
        style={{width: "100%",}}
        onSelect={(value) => props.setCalcSettings({...props.calcSettings, grouping: value})}
      />
    </CalcPanel>
  );
}

const RegionPanel = (props) => {
  const options = [
    {value: "none", label: "--"},
    {value: "alabama", label: "Alabama"},
    {value: "wisconsin", label: "Wisconsin"},
    {value: "wyoming", label: "Wyoming"}
  ];

  return (
    <CalcPanel title="Region">
      <Select
        options={options}
        defaultValue={props.calcSettings.region}
        disabled={["none", "budgetary", "cliff"].includes(props.calcSettings.metric)}
        style={{width: "100%",}}
        onSelect={(value) => props.setCalcSettings({...props.calcSettings, region: value})}
      />
    </CalcPanel>
  )
}

const TimePeriodPanel = (props) => {
  const options = props.inInHouseholdMode
    ? [
        {value: "none", label: "--"},
        {value: "netIncome", label: "Net income"},
        {value: "earningsVariation", label: "Earnings variation"},
        {value: "marginalTaxRate", label: "Marginal tax rate"}
    ]
    : [
        {value: "none", label: "--"},
        {value: "budgetary", label: "Budgetary impact"},
        {value: "outcomes", label: "Outcomes"},
        {value: "netIncomeAbsolute", label: "Net income (absolute)"},
        {value: "netIncomeRelative", label: "Net income (relative)"},
        {value: "cliff", label: "Net income cliffs"},
        {value: "poverty", label: "Poverty rate"},
        {value: "deepPoverty", label: "Deep poverty rate"},
        {value: "incomeInequality", label: "Income inequality"},
    ];

  return (
    <CalcPanel title="Time Period">
      <Input
        style={{
          maxWidth: "56px",
        }}
        value={props.calcSettings.startTime}
        onChange={(e) => props.setCalcSettings({...props.calcSettings, startTime: e.target.value})}
      ></Input>
      <span> to </span>
      <Input
        style={{
          maxWidth: "56px",
        }}
        value={props.calcSettings.endTime}
        onChange={(e) => props.setCalcSettings({...props.calcSettings, endTime: e.target.value})}
      ></Input>
    </CalcPanel>
  );
}

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
    <Input
      style={{maxWidth: "1.2in",}}
      value={props.obj[label][key]}
      onChange={(e) => handleChange(e)}
    />    
  );
}

const HouseholdRegionSelect = (props) => {
  const options = [
    {value: "none", label: "--"},
    {value: "alabama", label: "Alabama"},
    {value: "wisconsin", label: "Wisconsin"},
    {value: "wyoming", label: "Wyoming"}
  ];

  return (
    <Select
      options={options}
      style={{minWidth: "100px",}}
      defaultValue={props.tempHousehold.region.value}
      onSelect={(value) => (props.setTempHousehold({
        ...props.tempHousehold,
        region: {
          value: value,
          label: options.find(o => o.value === value).label
        }
      }))}
    />
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
            style={props.tempHousehold.dependents.length > 0 ? {width: "36px", padding: "0px"} : null}
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
        <ToggleHouseholdModeButton
          style={{height: "100%", width: "100px"}}
          isInHouseholdMode={props.isInHouseholdMode}
          toggle={() => props.setIsInHouseholdMode(!props.isInHouseholdMode)}
        />
        <MetricPanel
          isInHouseholdMode={props.isInHouseholdMode}
          calcSettings={props.calcSettings}
          setCalcSettings={props.setCalcSettings}
        />
        {props.isInHouseholdMode
          ? <HouseholdPanel 
              household={props.household}
              setHousehold={props.setHousehold}
              setIsInHouseholdMode={props.setIsInHouseholdMode}
            />
          : <>
              <GroupingPanel
                calcSettings={props.calcSettings}
                setCalcSettings={props.setCalcSettings}
              />
              <RegionPanel
                calcSettings={props.calcSettings}
                setCalcSettings={props.setCalcSettings}
              />
              <TimePeriodPanel
                calcSettings={props.calcSettings}
                setCalcSettings={props.setCalcSettings}
              />
            </>
        }
      </div>
    );
}