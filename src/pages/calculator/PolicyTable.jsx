import {
    useEffect,
    useState,
} from "react";
import {
    AddButton,
    RemoveButton,
    SearchSelect,
    ToggleEditSaveButton
} from "./controls";
import style from "../../style";

const parameterOptions = [
    {
        id: "par00000",
        label: "Child Tax Credit",
        currentLawValue: 100,
    },
    {
        id: "par00001",
        label: "Earned Income Tax Credit",
        currentLawValue: 500,
    },
    {
        id: "par00002",
        label: "Estate Tax",
        currentLawValue: 1000,
    },
    {
        id: "par00003",
        label: "Income Tax",
        currentLawValue: 200,
    },
];

const ReformMenu = (props) => {
    const reformOptions = [
        {
            id: "ref00001",
            title: "Evan's Decree",
            parameters: [
                {
                    id: "par00000",
                    reformValue: 1000,
                },
                {
                    id: "par00002",
                    reformValue: 0,
                }
            ],
        },
    ]
    
    const formattedOptions = reformOptions.map(option => ({value: option.id, label: option.title}));

    return (
        <SearchSelect
            options={formattedOptions}
            defaultValue={null}
            style={{ margin: 0, width: "50%" }}
            placeholder="Search for a reform"
            onSelect={(value) => {
                const selectedReform = reformOptions.find(reform => reform.id === value);
                props.loadReform({
                    ...selectedReform,
                    title: selectedReform.id === 'ref00000' ? "Untitled Reform" : selectedReform.title
                });
            }}
        />
    );
}

const ReformHeader = (props) => {
    const [showReformMenu, setShowReformMenu] = useState(false);

    const openReformMenu = () => {
        setShowReformMenu(true);
    }
    
    const loadReform = (reform) => {
        props.setReform(reform);
        props.setParameters(reform.parameters.map(p => props.parameterOptions.find(o => o.id === p.id)));
        setShowReformMenu(false);
    }      

    const editReform = () => {
        props.setTempReform(props.reform);
        props.setIsEditingReform(true);
    }

    const removeReform = () => {
        props.setReform(null);
    }

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "8px",
            }}
        >
            {!props.reform
                ? <>
                    <AddButton
                        style={{width: "50%",}}
                        label={"Build reform from scratch"}
                        add={() => loadReform({title: "Untitled Reform", id: "newref", parameters: []})}
                    />
                    <ReformMenu
                        loadReform={loadReform}
                    />
                </>
                : <>{props.isEditingReform
                        ? <input
                            value={props.tempReform.title}
                            onChange={(e) => props.modifyTempReform({title: e.target.value})}
                            onKeyDown={(e) => {if (e.key === 'Enter') props.saveReform();}}
                            style={{
                                width: "100%",
                                color: "black",
                            }}
                        />
                        : <b>{props.reform.title}</b>
                    }
                    <div>
                        <ToggleEditSaveButton
                            isEditing={props.isEditingReform}
                            edit={editReform}
                            save={props.saveReform} />
                        <RemoveButton
                            id={null}
                            remove={removeReform} />
                    </div>
                </>
            }
        </div>
    );
}

const HeaderRow = (props) => {
    return (
        <tr>
            <th
                style={{
                    padding: "5px",
                    color: "white",
                    backgroundColor: style.colors.BLUE,
                }}
            >
                Parameter
            </th>
            <th
                style={{
                    width: "100px",
                    padding: "5px",
                    color: "white",
                    backgroundColor: style.colors.BLUE,
                }}
            >
                Current
            </th>
            {!props.reform ? <>
                <th style={{width: "100px",}}/>
                <th style={{width: "36px",}}/>
            </> : <>
                <th
                    style={{
                        width: "100px",
                        padding: "5px",
                        color: "white",
                        backgroundColor: style.colors.TEAL_ACCENT,
                    }}
                >
                    Reform
                </th>
                <th style={{width: "36px",}} />
            </>}
        </tr>
    );
}

const ParameterRow = (props) => {
    const [tempReformValue, setTempReformValue] = useState(null);

    const removeParameter = (id) => {
        const updatedParameters = props.parameters.filter((p) => p.id !== id);
        props.setParameters(updatedParameters);
    };

    const handleMouseOver = (e) => {
        if (e.target.localName == "td") {
            const cells = e.target.parentNode.cells;
            for (let cell of cells) {
                if (cell.className === "data") {cell.style.backgroundColor = '#fff0db';}
            }
        }
    };

    const handleMouseOut = (e) => {
        if (e.target.localName == "td") {
            const cells = e.target.parentNode.cells;
            for (let cell of cells) {
                if (cell.className === "data") {cell.style.backgroundColor = 'white';}
            }
        }
    };

    useEffect(() => {
        if (props.tempReform) {
            const tempReformParameter = props.tempReform.parameters.find((p) => p.id === props.parameter.id);
            if (tempReformParameter) {
                setTempReformValue(tempReformParameter.reformValue);
            } else {
                setTempReformValue(props.parameter.currentLawValue);
            }
        }
    });

    return (
        <tr 
            key={props.parameter.id}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={props.onClick}
        >
            <td
                className={"data"}
                style={{
                    padding: "5px",
                    backgroundColor: "white",
                }}
            >
                {props.parameter.label}
            </td>
            <td
                className={"data"}
                style={{
                    padding: "5px",
                    backgroundColor: "white",
                }}
            >
                {props.parameter.currentLawValue}
            </td>
            {!props.reform
                ? null
                : <td
                    className={"data"}
                    style={{
                        padding: "5px",
                        backgroundColor: "white",
                    }}
                >
                    {props.isEditingReform
                    ? <input
                        value={tempReformValue} 
                        onChange={(e) => props.modifyTempReform({id: props.parameter.id, reformValue: e.target.value})}
                        onKeyDown={(e) => {if (e.key === 'Enter') props.saveReform()}}
                        style={{
                            width: "100%",
                        }}
                        />
                    : props.reformValue
                    }
                </td>
            }
            {props.isInParameterMenu
                ? null
                : <td
                    className={"action"}
                >
                    <RemoveButton
                        id={props.parameter.id}
                        remove={removeParameter}
                    />
                </td>
            }
        </tr>
    );
}

const ExplainerRow = (props) => {
    return (
        <tr>
            <td
                style={{
                    padding: "5px",
                    backgroundColor: "white",
                }}
                colSpan={props.reform ? 3 : 2}
                className={"explainer"}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        This is a description of the parameter <b>{props.parameter.label}</b> to help the user understand it and its implications for society and/or their household.
                    </div>
                    <div
                        style={{
                            border: "1px solid black",
                        }}
                    >
                        This is a chart depicting the value of this parameter over time under <b>{props.reform ? "reform" : "current"}</b> law.
                    </div>
                </div>
            </td>
        </tr>
    );
}

// const ParameterMenu = (props) => {
//     return (<>
//         {props.parameterOptions
//             .filter(option => !props.parameters.some(p => p.id === option.id))
//             .map((parameter) => (
//                 <ParameterRow
//                     key={parameter.id}
//                     isEditingReform={false}
//                     parameter={parameter}
//                     onClick={() => props.addParameter(parameter.id)}
//                     isInParameterMenu={true}
//                 />
//             ))
//         }
//     </>);
// }

const ParameterMenu = (props) => {
    const filteredOptions = props.parameterOptions.filter(o => !props.parameters.some(p => p.id === o.id));
    const formattedOptions = filteredOptions.map(o => ({value: o.id, label: o.label}));

    return (
        <SearchSelect
            options={formattedOptions}
            defaultValue={null}
            style={{ margin: 0, width: "100%" }}
            placeholder="Search for a parameter"
            onSelect={(id) => props.addParameter(id)}
        />
    );
}

const ParameterFooter = (props) => {
    const [showParameterMenu, setShowParameterMenu] = useState(false);

    const openParameterMenu = () => {
        setShowParameterMenu(true);
    }

    const addParameter = (id) => {
        props.setParameters([...props.parameters, props.parameterOptions.find((p) => p.id === id)]);
        setShowParameterMenu(false);
    };

    return (
        !showParameterMenu
            ? <AddButton
                label={"Parameter"}
                add={openParameterMenu}
            />
            : <ParameterMenu 
                parameters={props.parameters}
                parameterOptions={props.parameterOptions}
                addParameter={addParameter}
            />
    );
}

export default function PolicyTable(props) {
    const [tempReform, setTempReform] = useState(props.reform);

    const saveReform = () => {
        props.setReform(tempReform);
        props.setIsEditingReform(false);
    }

    const modifyTempReform = (obj) => {
        if (obj.title) {
            setTempReform({...tempReform, title: obj.title});
        } else {
        const tempReformParameter = tempReform.parameters.find((p) => p.id === obj.id);
        !tempReformParameter
            ? setTempReform({...tempReform, parameters: tempReform.parameters.concat(obj)})
            : setTempReform({...tempReform, parameters: tempReform.parameters.filter((p) => p.id !== obj.id).concat(obj)});
        }
    }

    return (
        <div
            style={{
                width: "100%",
                backgroundColor: "lightgray",
            }}
        >
            <ReformHeader
                isEditingReform={props.isEditingReform}
                setIsEditingReform={props.setIsEditingReform}
                reform={props.reform}
                setReform={props.setReform}
                saveReform={saveReform}
                parameters={props.parameters}
                setParameters={props.setParameters}
                tempReform={tempReform}
                setTempReform={setTempReform}
                modifyTempReform={modifyTempReform}
                parameterOptions={parameterOptions}
            />
            <table
                style={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderSpacing: "8px",
                    borderCollapse: "separate",
                }}
            >
            <thead>
                <HeaderRow
                    reform={props.reform}
                />
            </thead>
            <tbody>
                {props.parameters.map((parameter) => {
                    const reformParameter = props.reform ? props.reform.parameters.find((p) => p.id === parameter.id) : null;
                    
                    return (<>
                        <ParameterRow
                            key={parameter.id}
                            parameter={parameter}
                            parameters={props.parameters}
                            setParameters={props.setParameters}
                            isEditingReform={props.isEditingReform}
                            reform={props.reform}
                            saveReform={saveReform}
                            tempReform={tempReform}
                            modifyTempReform={modifyTempReform}
                            reformValue={reformParameter ? reformParameter.reformValue : parameter.currentLawValue}
                            onClick={(e) => {
                                if (e.target.className==="data") {
                                    parameter.id === props.expandedParameterId ? props.setExpandedParameterId(null) : props.setExpandedParameterId(parameter.id);
                                }
                            }}
                        />
                        {parameter.id === props.expandedParameterId
                            ? <ExplainerRow
                                parameter={parameter}
                                reform={props.reform}
                            />
                            : null
                        }
                    </>);
                })}
            </tbody>
            <ParameterFooter
                parameters={props.parameters}
                setParameters={props.setParameters}
                parameterOptions={parameterOptions}
            />
            </table>
        </div>
    );
}