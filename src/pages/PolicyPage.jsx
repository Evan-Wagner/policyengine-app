import { BookOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
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

  function ParameterMenu({ addParameter, existingParameters }) {
    const parameterOptions = [
      {
        name: "Child Tax Credit",
        currentLawValue: 100,
      },
      {
        name: "Earned Income Tax Credit",
        currentLawValue: 500,
      },
      {
        name: "Estate Tax",
        currentLawValue: 1000,
      },
      {
        name: "Income Tax",
        currentLawValue: 200,
      },
    ].filter(option => !existingParameters.some(param => param.name === option.name));

    return (
      <table>
        <th>Parameter</th>
        <th>Current Law Value</th>
        {parameterOptions.map((parameter, index) => (
          <tr key={index} 
              style={{
                border: '1px solid black', 
                padding: '5px', 
                cursor: 'pointer', 
                marginBottom: '5px'
              }}
              onClick={() => addParameter(parameter)}
              onMouseOver={(e) => e.target.style.backgroundColor = 'lightgray'}
              onMouseOut={(e) => e.target.style.backgroundColor = ''}
          >
            <td>{parameter.name}</td>
            <td>{parameter.currentLawValue}</td>
          </tr>
        ))}
      </table>
    );
  }

  function ParameterTable(props) {
    const [editingParamIndex, setEditingParamIndex] = useState(null);
    const [tempValue, setTempValue] = useState(null);

    const handleEditClick = (index, value) => {
      setEditingParamIndex(index);
      setTempValue(value);
    };

    const handleSaveClick = () => {
      props.updateParameter(editingParamIndex, tempValue);
      setEditingParamIndex(null);
      setTempValue(null);
    };

    const handleRemoveClick = (index) => {
      props.removeParameter(index);
    };

    return (
      <table>
        {props.parameters.map((parameter, index) => {
          return (
            <tr key={index}>
              <th>{parameter.name}</th>
              <td>
                {props.isCurrentLaw ? parameter.currentLawValue : editingParamIndex === index ?
                  <input 
                    value={tempValue} 
                    onChange={(e) => setTempValue(e.target.value)}
                  /> :
                  parameter.reformValue
                }
              </td>
              {!props.isCurrentLaw &&
                <td>
                  <button onClick={() => 
                    editingParamIndex === index ? 
                      handleSaveClick() : handleEditClick(index, parameter.reformValue)
                  }>
                    {editingParamIndex === index ? 'Save' : 'Edit'}
                  </button>
                  <button onClick={() => handleRemoveClick(index)}>
                    Remove
                  </button>
                </td>
              }
            </tr>
          );
        })}
      </table>
    )
  }

  function PolicyScenario(props) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(props.title);

    const [showParameterMenu, setShowParameterMenu] = useState(false);

    const addParameter = (newParam) => {
      props.addNewParameter(newParam);
      setShowParameterMenu(false);
    };
  
    return (
      <div
        style={{
          width: "100%",
          padding: "5px",
          marginBottom: "10px",
          backgroundColor: "lightgray",
          border: '1px solid '+style.colors.BLUE,
        }}
      >
        {isEditingTitle ? 
          <input value={title} onChange={(e) => setTitle(e.target.value)} /> :
          <b>{title}</b>
        }
        {!props.isCurrentLaw ? 
        <button onClick={() => { 
          if (isEditingTitle) props.updateTitle(title);
          setIsEditingTitle(!isEditingTitle);
        }}>
            {isEditingTitle ? 'Save' : 'Edit'}
          </button> : null
        }
        {props.isCurrentLaw && props.parameters.length == 0 ?
          <><br /><i>Add at least one parameter to view current law values.</i></> :
          <ParameterTable
            parameters={props.parameters}
            isCurrentLaw={props.isCurrentLaw}
            updateParameter={props.updateParameter}
            removeParameter={props.removeParameter}
          />
        }
        {!props.isCurrentLaw && !showParameterMenu ? 
          <button onClick={() => setShowParameterMenu(true)}>Add Parameter</button> : 
          null
        }
        {showParameterMenu ? 
          <ParameterMenu 
            addParameter={addParameter} 
            existingParameters={props.parameters} 
          /> : 
          null
        }
      </div>
    );
  }

  function ChartSetting(props) {
    return (
      <div
        style={{
          padding: "5px",
          border: "solid 1px black",
        }}
      >
        <b>{props.title}</b><br />
        {props.children}
      </div>
    );
  }

  function ChartSettings(props) {
    const [household, setHousehold] = useState("none");
    const [region, setRegion] = useState("all");
    const [metric, setMetric] = useState("budgetaryImpact");
    const [grouping, setGrouping] = useState("none");
    const [startTime, setStartTime] = useState("2024");
    const [endTime, setEndTime] = useState("2027");

    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          padding: "10px",
          marginBottom: "10px",
          overflow: "hidden",
          overflowX: "auto",
          backgroundColor: "lightgray",
        }}
      >
        <ChartSetting
          title="Household"
        >
          <select
            value={household}
            onChange={(e) => setHousehold(e.target.value)}
          >
            <option value="none">None</option>
            <option value="byAge">My household</option>
          </select>
        </ChartSetting>
        <ChartSetting
          title="Region"
        >
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="all">All</option>
            <option value="alabama">Alabama</option>
            <option value="wyoming">Wyoming</option>
          </select>
        </ChartSetting>
        <ChartSetting
          title="Metric"
        >
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            {household !== "none" ? <>
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
        </ChartSetting>
        {household !== "none" || metric === "budgetaryImpact" ? null : <ChartSetting
          title="Grouping"
        >
          <select
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
          >
            <option value="none">None</option>
            <option value="byAge">By age</option>
            <option value="bySex">By gender</option>
            <option value="byRace">By race</option>
            <option value="byIncomeLevel">By income level</option>
          </select>
        </ChartSetting>}
        {household !== "none" ? null : <ChartSetting
          title="Time Period"
        >
          <input
            style={{
              maxWidth: "52px",
            }}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          ></input>
          <span>  to  </span>
          <input
            style={{
              maxWidth: "52px",
            }}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          ></input>
        </ChartSetting>}
      </div>
    );
  }

  function ExpandCollapseButton(props) {
    return (
      <button 
        onClick={props.toggleExpand}
        style={{
          height: "20px",
          width: "20px",
          backgroundColor: props.expanded ? "#FFD700" : "white",
        }}
      />
    );
  }

  function SectionHeader(props) {
    return (
      <div
        style={{
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          width: props.title === "Output" && !props.expanded ? "auto" : "100%",
          height: props.title === "Output" && !props.expanded ? "100%" : "auto",
          backgroundColor: "lightgray",
          fontSize: 30,
        }}
        onClick={props.toggleExpand}
      >
        {props.expanded || props.title !== "Output" ? props.title : null}
        {props.title == "Output" ? <ExpandCollapseButton 
          expanded={props.expanded} 
          toggleExpand={props.toggleExpand}
        /> : null}
      </div>
    );
  }

  function SectionBody(props) {
    return (props.expanded ?
      <div
        style={{
          flex: 1,
          width: "100%",
          padding: "10px",
          overflow: "hidden",
          overflowY: "auto",
          backgroundColor: "darkgray",
        }}
      >
        {props.children}
      </div> : null
    );
  }

  function LeftColumn() {
    const [policyTitle, setPolicyTitle] = useState("Untitled Reform");

    const [parameters, setParameters] = useState([]);

    const addNewParameter = (newParam) => {
      setParameters([...parameters, {...newParam, reformValue: newParam.currentLawValue}]);
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
      <div
        style={{
          display: "flex",
          flex: 1.5,
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          padding: "2.5px",
          height: "100%",
          width: "calc(100% - min-content)"
        }}
      >
        <SectionHeader
          title="Input"
          />
        <SectionBody
          expanded={true}
        >
          <PolicyScenario
            title="Current Law"
            isCurrentLaw={true}
            parameters={parameters}
          />
          <PolicyScenario
            title={policyTitle}
            isCurrentLaw={false}
            parameters={parameters}
            updateTitle={setPolicyTitle}
            addNewParameter={addNewParameter}
            updateParameter={updateParameter}
            removeParameter={removeParameter}
          />
        </SectionBody>
        <ChartSettings
          
        />
      </div>
    );
  }

  function RightColumn() {
    const [outputExpanded, setOutputExpanded] = useState(true);

    return (
      <div
        style={{
          display: "flex",
          flex: outputExpanded ? 1 : "none",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          padding: "2.5px",
          height: "100%",
        }}
      >
        <SectionHeader
          title="Output"
          expanded={outputExpanded}
          toggleExpand={() => setOutputExpanded(!outputExpanded)}
          />
        <SectionBody
          expanded={outputExpanded}
        >
          Charts output here.
        </SectionBody>
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
      <LeftColumn />
      <RightColumn />
    </div>
  );
}
