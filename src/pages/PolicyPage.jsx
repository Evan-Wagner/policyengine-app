import {
  BookOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  GlobalOutlined,
  HomeOutlined,
  HourglassOutlined,
  MinusOutlined,
  PlusOutlined,
  PushpinOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Drawer } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { copySearchParams } from "../api/call";
import { findInTree } from "../api/variables";
import Button from "../controls/Button";
import NavigationButton from "../controls/NavigationButton";
import SearchOptions from "../controls/SearchOptions";
import FolderPage from "../layout/FolderPage";
import LoadingCentered from "../layout/LoadingCentered";
import useMobile from "../layout/Responsive";
import StackedMenu from "../layout/StackedMenu";
import ThreeColumnPage from "../layout/ThreeColumnPage";
import style from "../style";
import ParameterEditor from "./policy/input/ParameterEditor";
import PolicyOutput from "./policy/output/PolicyOutput";
import PolicyRightSidebar from "./policy/PolicyRightSidebar";
import getPolicyOutputTree from "./policy/output/tree";
import { capitalize } from "../api/language";

function ParameterSearch(props) {
  const { metadata } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const options = Object.values(metadata.parameters)
    .filter((parameter) => parameter.type === "parameter")
    .map((parameter) => ({
      value: parameter.parameter,
      label: parameter.label,
    }))
    .filter((option) => !!option.label && !!option.value)
    .reverse();
  return (
    <SearchOptions
      options={options}
      defaultValue={null}
      style={{ margin: 0, width: "100%" }}
      placeholder="Search for a parameter"
      onSelect={(value) => {
        let newSearch = copySearchParams(searchParams);
        newSearch.set("focus", value);
        setSearchParams(newSearch);
      }}
    />
  );
}

function PolicyLeftSidebar(props) {
  const { metadata } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const POLICY_OUTPUT_TREE = getPolicyOutputTree(metadata.countryId);
  const selected = searchParams.get("focus") || "";
  const onSelect = (name) => {
    let newSearch = copySearchParams(searchParams);
    newSearch.set("focus", name);
    setSearchParams(newSearch);
  };
  // The menu, then the search bar anchored to the bottom
  return (
    <div>
      <div style={{ padding: 10 }}>
        <ParameterSearch metadata={metadata} />
      </div>
      <StackedMenu
        firstTree={metadata.parameterTree.children}
        selected={selected}
        onSelect={onSelect}
        secondTree={POLICY_OUTPUT_TREE[0].children}
      />
    </div>
  );
}

function MobileMiddleBar(props) {
  const { metadata } = props;
  const [searchMode, setSearchMode] = useState(false);
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: "85%",
          height: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!searchMode ? (
          <MobileTreeNavigationHolder metadata={metadata} />
        ) : (
          <ParameterSearch metadata={metadata} />
        )}
      </div>
      <div
        style={{
          width: "15%",
          backgroundColor: style.colors.LIGHT_GRAY,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!searchMode ? (
          <SearchOutlined
            style={{
              fontSize: 20,
              color: style.colors.BLACK,
            }}
            onClick={() => setSearchMode(!searchMode)}
          />
        ) : (
          <CloseOutlined
            style={{
              fontSize: 20,
              color: style.colors.BLACK,
            }}
            onClick={() => setSearchMode(!searchMode)}
          />
        )}
      </div>
    </div>
  );
}

function MobileTreeNavigationHolder(props) {
  const { metadata } = props;
  const POLICY_OUTPUT_TREE = getPolicyOutputTree(metadata.countryId);
  // Try to find the current focus in the tree.
  const [searchParams, setSearchParams] = useSearchParams();
  const focus = searchParams.get("focus");
  let currentNode;
  useEffect(() => {
    // On load, scroll the current breadcrumb into view.
    const breadcrumb = document.getElementById("current-breadcrumb");
    // Smoothly scroll the breadcrumb into view, with padding.
    if (breadcrumb) {
      breadcrumb.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [focus]);
  if (focus && focus.startsWith("policyOutput")) {
    currentNode = { children: POLICY_OUTPUT_TREE };
  } else {
    currentNode = { children: [metadata.parameterTree] };
  }
  let breadcrumbs = [];
  try {
    let stem = "";
    for (let name of focus.split(".")) {
      stem += name;
      const fixedStem = stem;
      currentNode = currentNode.children.find(
        (node) => node.name === fixedStem,
      );
      breadcrumbs.push({
        name: stem,
        label: currentNode.label,
      });
      stem += ".";
    }
  } catch (e) {
    currentNode = null;
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        padding: 15,
        backgroundColor: style.colors.LIGHT_GRAY,
        overflowX: "scroll",
        height: 50,
        alignItems: "center",
        width: "100%",
      }}
    >
      {breadcrumbs.map((breadcrumb, i) => (
        <h5
          key={breadcrumb.name}
          id={i === breadcrumbs.length - 1 ? "current-breadcrumb" : null}
          style={{
            cursor: "pointer",
            fontSize: 18,
            maxHeight: 20,
            maxWidth: 200,
            paddingLeft: 10,
            paddingRight: 10,
            whiteSpace: "nowrap",
            margin: 0,
            height: "100%",
          }}
          onClick={() => {
            let newSearch = copySearchParams(searchParams);
            newSearch.set("focus", breadcrumb.name);
            setSearchParams(newSearch);
          }}
        >
          {capitalize(breadcrumb.label)}
          {i < breadcrumbs.length - 1 && (
            <span
              style={{
                color: style.colors.DARK_GRAY,
                paddingRight: 5,
                paddingLeft: 10,
              }}
            >
              {"/"}
            </span>
          )}
        </h5>
      ))}
    </div>
  );
}

function MobileBottomMenu(props) {
  const { metadata, policy } = props;
  const [searchParams] = useSearchParams();
  const hasReform = searchParams.get("reform") !== null;
  const focus = searchParams.get("focus") || "";
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);

  const handleClick = () => {
    return setPolicyDrawerOpen(false);
  };

  return (
    <div
      style={{
        padding: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "20vh",
      }}
    >
      <div>
        {focus && focus.startsWith("policyOutput") && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <NavigationButton primary text="Edit my policy" focus="gov" />
            <Button
              style={{
                margin: 5,
              }}
              text={<BookOutlined />}
              onClick={() => setPolicyDrawerOpen(true)}
            />
          </div>
        )}
        {focus && !focus.startsWith("policyOutput") && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <NavigationButton
              primary
              text="Calculate economic impact"
              focus="policyOutput"
            />
            <Button
              style={{
                margin: 5,
              }}
              text={<BookOutlined />}
              onClick={() => setPolicyDrawerOpen(true)}
            />
          </div>
        )}
        {!hasReform && (
          <NavigationButton
            text="Enter my household"
            focus="input"
            target={`/${metadata.countryId}/household`}
          />
        )}
        {hasReform && (
          <NavigationButton
            text="Calculate my household impact"
            focus="input"
            target={`/${metadata.countryId}/household`}
          />
        )}
        <Drawer
          open={policyDrawerOpen}
          onClose={(e) => handleClick(e)}
          placement="bottom"
          title="Your policy"
          height="60vh"
        >
          <PolicyRightSidebar
            metadata={metadata}
            policy={policy}
            closeDrawer={handleClick}
            hideButtons
          />
        </Drawer>
      </div>
    </div>
  );
}

function MobilePolicyPage(props) {
  const { mainContent, metadata, policy } = props;
  const [searchParams] = useSearchParams();
  const embed = searchParams.get("embed") !== null;
  if (embed) {
    return mainContent;
  }
  return (
    <>
      <div
        style={{
          overflow: "scroll",
          width: "100%",
          padding: 20,
          height: "65vh",
        }}
      >
        {mainContent}
      </div>
      <MobileMiddleBar metadata={metadata} />
      <MobileBottomMenu metadata={metadata} policy={policy} />
    </>
  );
}

export default function PolicyPage(props) {
  document.title = "Policy | PolicyEngine";
  const {
    metadata,
    policy,
    setPolicy,
    hasShownPopulationImpactPopup,
    setHasShownPopulationImpactPopup,
  } = props;
  const POLICY_OUTPUT_TREE = getPolicyOutputTree(metadata.countryId);
  const mobile = useMobile();

  const [searchParams, setSearchParams] = useSearchParams();
  const focus = searchParams.get("focus") || "";

  useEffect(() => {
    if (!focus) {
      let newSearch = copySearchParams(searchParams);
      newSearch.set("focus", "gov");
      setSearchParams(newSearch);
    }
  });

  // If we've landed on the page without a reform policy, create a new one.
  useEffect(() => {
    if (!policy.reform.data && !searchParams.get("reform")) {
      let newSearch = copySearchParams(searchParams);
      newSearch.set(
        "reform",
        metadata.countryId === "us" ? 2 : metadata.countryId === "uk" ? 1 : 3,
      );
      setSearchParams(newSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!policy.reform.data]);

  let middle = null;

  if (!policy.reform.data) {
    middle = <LoadingCentered />;
  } else if (
    Object.keys(metadata.parameters).includes(focus) &&
    metadata.parameters[focus].type === "parameter"
  ) {
    middle = (
      <ParameterEditor
        parameterName={focus}
        metadata={metadata}
        policy={policy}
        setPolicy={setPolicy}
      />
    );
  } else if (Object.keys(metadata.parameters).includes(focus)) {
    const node = findInTree({ children: [metadata.parameterTree] }, focus);
    middle = (
      <FolderPage label={node.label} metadata={metadata} inPolicySide>
        {node.children}
      </FolderPage>
    );
  } else if (focus === "policyOutput") {
    middle = (
      <FolderPage label="Policy impact" metadata={metadata}>
        {POLICY_OUTPUT_TREE[0].children}
      </FolderPage>
    );
  } else if (focus.includes("policyOutput.")) {
    middle = (
      <>
        <PolicyOutput
          metadata={metadata}
          policy={policy}
          hasShownPopulationImpactPopup={hasShownPopulationImpactPopup}
          setHasShownPopulationImpactPopup={setHasShownPopulationImpactPopup}
        />
      </>
    );
  }

  if (mobile) {
    return (
      <MobilePolicyPage
        mainContent={middle}
        metadata={metadata}
        policy={policy}
      />
    );
  }

  const [reform, setReform] = useState(null);

  const [household, setHousehold] = useState({
    region: "none",
    head: {
      age: 0,
      income: 0,
    },
    spouse: null,
    dependents: [],
  });

  function ReformMenu(props) {
    const reformOptions = [
      {
        id: "ref00000",
        name: "New Reform From Scratch",
        parameters: [],
      },
      {
        id: "ref00001",
        name: "Evan's Decree",
        parameters: [
          {
            id: "par00000",
            name: "Child Tax Credit",
            currentLawValue: 200,
            reformValue: 1000,
          },
          {
            id: "par00002",
            name: "Estate Tax",
            currentLawValue: 1000,
            reformValue: 0,
          }
        ],
      },
    ]

    return (
      <select
        value="none"
        onChange={(e) => {
          const selectedReform = reformOptions.find(reform => reform.id === e.target.value);
          props.loadReform({...selectedReform, name: selectedReform.id === 'ref00000' ? "Untitled Reform" : selectedReform.name});
        }}
      >
        <option value="none">--</option>
        {reformOptions.map((reform, index) => (
          <option
            key={index}
            value={reform.id}
          >
            {reform.name}
          </option>
        ))}
      </select>
    )
  }

  function ParameterMenu(props) {
    const parameterOptions = [
      {
        id: "par00000",
        name: "Child Tax Credit",
        currentLawValue: 100,
      },
      {
        id: "par00001",
        name: "Earned Income Tax Credit",
        currentLawValue: 500,
      },
      {
        id: "par00002",
        name: "Estate Tax",
        currentLawValue: 1000,
      },
      {
        id: "par00003",
        name: "Income Tax",
        currentLawValue: 200,
      },
    ].filter(option => !props.existingParameters.some(param => param.id === option.id));

    return (<>
      {parameterOptions.map((parameter, index) => (
        <tr key={index} 
            style={{
              cursor: 'pointer',
            }}
            onClick={() => props.addParameter(parameter)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#fff0db'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
        >
          <td style={{backgroundColor: "white",}}>{parameter.name}</td>
          <td style={{backgroundColor: "white",}}>{parameter.currentLawValue}</td>
        </tr>
      ))}
    </>);
  }

  function ParameterRow(props) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempParamValue, setTempParamValue] = useState(props.parameter.reformValue)

    const editParameter = () => {
      setIsEditing(true);
      setTempParamValue(props.parameter.reformValue);
    };
  
    const saveParameter = () => {
      props.updateParameter(props.index, tempParamValue);
      setIsEditing(false);
      setTempParamValue(null);
    };

    return (
      <tr key={props.index}>
        <td
          style={{
            padding: "5px",
            backgroundColor: "#fff0db",
          }}
        >
          {props.parameter.name}
        </td>
        <td
          style={{
            padding: "5px",
            backgroundColor: "#fff0db",
          }}
        >
          {props.parameter.currentLawValue}
        </td>
        {!props.reformLoaded ? <>
          <td />
          <td />
        </> : <>
          <td
            style={{
              padding: "5px",
              backgroundColor: "#fff0db",
            }}
          >
            {isEditing ? 
              <input
                value={tempParamValue} 
                onChange={(e) => setTempParamValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveParameter(tempParamValue);
                  }
                }}
                style={{
                  width: "100%",
                }}
              /> :
              props.parameter.reformValue
            }
          </td>
          <td>
            <button onClick={() => 
              isEditing ? saveParameter() : editParameter()
            }>
              {isEditing ? <SaveOutlined /> : <EditOutlined />}
            </button>
            <button onClick={() => props.removeParameter(props.index)}>
              <DeleteOutlined />
            </button>
          </td>
        </>}
      </tr>
    );
  }

  function PolicyTable() {
    const [parameters, setParameters] = useState([]);
    const [showParameterMenu, setShowParameterMenu] = useState(false);
    const [showReformMenu, setShowReformMenu] = useState(false);
    const [reformLoaded, setReformLoaded] = useState(false);
    const [title, setTitle] = useState('');
    const [tempTitle, setTempTitle] = useState(title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const loadReform = (reform) => {
      setTitle(reform.name);
      setTempTitle(reform.name);
      setParameters(Object.values(
        [...parameters, ...reform.parameters].reduce((acc, cur) => {
          acc[cur.id] = cur;
          return acc;
        }, {})
      ));
      setShowReformMenu(false);
      setReformLoaded(true);
    }

    const removeReform = () => {
      setReformLoaded(false);
    }
  
    const addParameter = (newParam) => {
      setParameters([...parameters, {...newParam, reformValue: newParam.currentLawValue}]);
      setShowParameterMenu(false);
    };

    const updateParameter = (index, newValue) => {
      const updatedParameters = [...parameters];
      updatedParameters[index].reformValue = newValue;
      setParameters(updatedParameters);
    };

    const removeParameter = (index) => {
      const updatedParameters = [...parameters];
      updatedParameters.splice(index, 1);
      setParameters(updatedParameters);
    };
  
    return (
      <table
        style={{
          width: "100%",
          tableLayout: "fixed",
          borderSpacing: "8px",
          borderCollapse: "separate",
          backgroundColor: "lightgray",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: "40%",
                padding: "5px",
                color: "white",
                backgroundColor: style.colors.BLUE,
              }}
            >
              Parameter
            </th>
            <th
              style={{
                padding: "5px",
                color: "white",
                backgroundColor: style.colors.BLUE,
              }}
            >
              Current Law
            </th>
            {!reformLoaded ? <>
              <th>
                {showReformMenu ?
                <ReformMenu
                  loadReform={loadReform}
                /> :
                <button onClick={() => setShowReformMenu(true)}>
                  Add Reform
                </button>}
              </th>
              <th style={{width: "70px",}} />
            </> : <>
              <th
                style={{
                  padding: "5px",
                  color: "white",
                  backgroundColor: style.colors.TEAL_ACCENT,
                }}
              >
                {isEditingTitle ? 
                  <input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setTitle(tempTitle);
                        setIsEditingTitle(!isEditingTitle);
                      }
                    }}
                    style={{
                      width: "100%",
                      color: "black",
                    }}
                  /> :
                  <b>{title}</b>
                }
              </th>
              <th style={{width: "70px",}}>
                <button onClick={() => { 
                  if (isEditingTitle) setTitle(tempTitle);
                  setIsEditingTitle(!isEditingTitle);
                }}>
                    {isEditingTitle ? <SaveOutlined /> : <EditOutlined />}
                </button>
                <button onClick={() => removeReform()}>
                  <DeleteOutlined />
                </button>
              </th>
            </>
            }
          </tr>
        </thead>
        <tbody>
          {parameters.map((parameter, index) => (
            <ParameterRow
              parameter={parameter}
              key={index}
              index={index}
              reformLoaded={reformLoaded}
              updateParameter={updateParameter}
              removeParameter={removeParameter}
            />
          ))}
          {!showParameterMenu ?
            <tr>
              <td>
                <button onClick={() => setShowParameterMenu(true)}>Add Parameter</button>
              </td>
            </tr> : 
            <ParameterMenu 
              addParameter={addParameter} 
              existingParameters={parameters} 
            />
          }
        </tbody>
      </table>
    );
  }

  function CalcSetting(props) {
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

  function HouseholdPanel(props) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempHousehold, setTempHousehold] = useState(props.household);

    const editHousehold = () => {
      setTempHousehold(props.household);
      setIsEditing(true);
    }

    const saveHousehold = () => {
      props.setHousehold(tempHousehold);
      setIsEditing(false);
      props.setIsInHouseholdMode(true);
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
          <b>Household</b><br />
          <PushpinOutlined /><span>
            {isEditing ?
            <select
              value={tempHousehold.region}
              onChange={(e) => (setTempHousehold({...tempHousehold, region: e.target.value}))}
            >
              <option value="none">--</option>
              <option value="alabama">Alabama</option>
              <option value="wisconsin">Wisconsin</option>
              <option value="wyoming">Wyoming</option>
            </select> : 
            props.household.region
            }
          </span><br />
          {isEditing ?
            <button onClick={() => saveHousehold()}>
              <SaveOutlined /> 
            </button> :
            <button onClick={() => editHousehold()}>
              <EditOutlined />
            </button>}
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
          <div
            style={{
              borderRight: "1px solid black",
              paddingRight: "5px",
            }}
          >
            <b>Head</b><br />
            {isEditing ? <>
            <input
              style={{maxWidth: "30px",}}
              value={tempHousehold.head.age}
              onChange={(e) => (setTempHousehold({...tempHousehold, head: {...tempHousehold.head, age: e.target.value}}))}
            /><br />
            <input
              style={{maxWidth: "30px",}}
              value={tempHousehold.head.income}
              onChange={(e) => (setTempHousehold({...tempHousehold, head: {...tempHousehold.head, income: e.target.value}}))}
            />
            </> : <>
              {props.household.head.age}y<br />
              {props.household.head.income}
            </>}
          </div>
          {tempHousehold.spouse ? <div
            style={{
              borderRight: "1px solid black",
              paddingRight: "5px",
            }}
          >
            <b>Spouse </b>
            {isEditing ? <button onClick={() => setTempHousehold({...tempHousehold, spouse: null})}>
              <MinusOutlined />
            </button> : null}
            <br />
            {isEditing ? <>
              <input
                style={{maxWidth: "30px",}}
                value={tempHousehold.spouse.age}
                onChange={(e) => (setTempHousehold({...tempHousehold, spouse: {...tempHousehold.spouse, age: e.target.value}}))}
              /><br />
              <input
                style={{maxWidth: "30px",}}
                value={tempHousehold.spouse.income}
                onChange={(e) => (setTempHousehold({...tempHousehold, spouse: {...tempHousehold.spouse, income: e.target.value}}))}
              />
            </> : <>
              {props.household.spouse.age}y<br />
              {props.household.spouse.income}
            </>}
          </div> : isEditing ? <div>
            <button onClick={() => setTempHousehold({...tempHousehold, spouse: {age: 0, income: 0}})}>
              <PlusOutlined /> Spouse
            </button>
          </div> : null}
          {tempHousehold.dependents.length > 0 ? <div>
            <b>Dependents </b>
            {isEditing ? <button onClick={() => setTempHousehold({...tempHousehold, dependents: tempHousehold.dependents.concat({age: 0, income: 0})})}>
                <PlusOutlined />
              </button> : null}
            <br />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
              }}
            >
              <br />
              {tempHousehold.dependents.map((dependent, index) => (
                <div
                  key={index}
                  style={{
                    borderRight: "1px solid black",
                    paddingRight: "5px",
                  }}
                >
                  {isEditing ? <>
                    <input
                      style={{maxWidth: "30px",}}
                      value={dependent.age}
                      onChange={(e) => setTempHousehold({
                        ...tempHousehold,
                        dependents: tempHousehold.dependents.map((d, i) => {
                          return i === index ? {...d, age: e.target.value} : d
                        })
                      })}
                    />
                    <button onClick={() => setTempHousehold({...tempHousehold, dependents: tempHousehold.dependents.filter((_, i) => i !== index)})}>
                      <MinusOutlined />
                    </button>
                    <br />
                    <input
                      style={{maxWidth: "30px",}}
                      value={dependent.income}
                      onChange={(e) => setTempHousehold({
                        ...tempHousehold,
                        dependents: tempHousehold.dependents.map((d, i) => {
                          return i === index ? {...d, income: e.target.value} : d
                        })
                      })}
                    />
                  </> : <>
                    {dependent.age}y<br />
                    {dependent.income}
                  </>}
                </div>
              ))}
            </div>
          </div> : isEditing ? <div>
            <button onClick={() => setTempHousehold({...tempHousehold, dependents: [{age: 0, income: 0}]})}>
              <PlusOutlined /> Dependents
            </button>
          </div> : null}
        </div>
      </div>
    );
  }

  function CalcPanel(props) {
    const [isInHouseholdMode, setIsInHouseholdMode] = useState(false);
    const [region, setRegion] = useState("none");
    const [metric, setMetric] = useState("none");
    const [grouping, setGrouping] = useState("none");
    const [startTime, setStartTime] = useState("2024");
    const [endTime, setEndTime] = useState("2027");

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
          onClick={() => setIsInHouseholdMode(!isInHouseholdMode)}
        >
          {isInHouseholdMode ? <HomeOutlined /> : <GlobalOutlined />}
        </button>
        <CalcSetting title="Metric" flex="1">
          <select
            value={metric}
            style={{width: "100%",}}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="none">--</option>
            {isInHouseholdMode ? <>
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
        </CalcSetting>
        {isInHouseholdMode ? <HouseholdPanel 
          household={props.household}
          setHousehold={props.setHousehold}
          setIsInHouseholdMode={setIsInHouseholdMode}
        /> : <>
          <CalcSetting title="Grouping" flex="1">
            <select
              value={metric === "budgetaryImpact" ? "none" : grouping}
              disabled={["none", "budgetaryImpact", "cliffImpact"].includes(metric)}
              style={{width: "100%",}}
              onChange={(e) => setGrouping(e.target.value)}
            >
              <option value="none">--</option>
              <option value="byAge">By age</option>
              <option value="bySex">By sex</option>
              <option value="byRace">By race</option>
              <option value="byIncomeLevel">By income level</option>
            </select>
          </CalcSetting>
          <CalcSetting title="Region" flex="1">
            <select
              value={metric === "budgetaryImpact" ? "none" : region}
              disabled={["none", "budgetaryImpact", "cliffImpact"].includes(metric)}
              style={{width: "100%",}}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="none">--</option>
              <option value="alabama">Alabama</option>
              <option value="wyoming">Wyoming</option>
            </select>
          </CalcSetting>
          <CalcSetting title="Time Period" flex="1">
            <input
              style={{
                maxWidth: "48px",
              }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            ></input>
            <span>  to  </span>
            <input
              style={{
                maxWidth: "48px",
              }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            ></input>
          </CalcSetting>
        </>}
      </div>
    );
  }

  function SectionHeader(props) {
    return (
      <div
        style={{
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          height: "auto",
          backgroundColor: "lightgray",
          fontSize: 30,
        }}
      >
        {props.title}
      </div>
    );
  }

  function SectionBody(props) {
    return (
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          padding: "10px",
          overflow: "hidden",
          overflowY: "auto",
          backgroundColor: "darkgray",
        }}
      >
        {props.children}
      </div>
    );
  }

  function Column(props) {
    return (
      <div
        style={{
          display: "flex",
          flex: props.flexValue,
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          padding: "2.5px",
          height: "100%",
        }}
      >
        {props.children}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        height: "90vh",
        width: "100%",
        boxSizing: "border-box",
        padding: 10,
        fontSize: 18,
      }}
    >
      <Column flexValue="1.5">
        <SectionHeader title="Input"/>
        <SectionBody>
          <PolicyTable
            reform={reform}
            setReform={setReform}
          />
        </SectionBody>
        <CalcPanel
          household={household}
          setHousehold={setHousehold}
        />
      </Column>
      <Column flexValue="1">
        <SectionHeader title="Output"/>
        <SectionBody>
          Charts output here.
        </SectionBody>
      </Column>
    </div>
  );
}
