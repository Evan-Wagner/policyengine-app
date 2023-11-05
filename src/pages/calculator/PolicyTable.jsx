import { useState, useEffect } from "react";
import {
    AddButton,
    RemoveButton,
    ToggleEditSaveButton
 } from "./buttons";
import style from "../../style";

const ReformMenu = (props) => {
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
                    reformValue: 1000,
                },
                {
                    id: "par00002",
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
                props.loadReform({
                    ...selectedReform,
                    name: selectedReform.id === 'ref00000' ? "Untitled Reform" : selectedReform.name
                });
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

const ParameterRow = (props) => {
    const [tempReformValue, setTempReformValue] = useState(null);

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
                {props.parameter.name}
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
                    {props.isEditing
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
                        remove={props.removeParameter}
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
                        This is a description of the parameter <b>{props.parameter.name}</b> to help the user understand it and its implications for society and/or their household.
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

const ParameterMenu = (props) => {
    return (<>
        {props.parameterOptions
            .filter(option => !props.parameters.some(p => p.id === option.id))
            .map((parameter) => (
                <ParameterRow
                    key={parameter.id}
                    isEditing={false}
                    parameter={parameter}
                    removeParameter={props.removeParameter}
                    onClick={() => props.addParameter(parameter.id)}
                    isInParameterMenu={true}
                />
            ))
        }
    </>);
}

export default function PolicyTable(props) {
    const [showParameterMenu, setShowParameterMenu] = useState(false);
    const [showReformMenu, setShowReformMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempReform, setTempReform] = useState(props.reform);
    const [expandedParameterId, setExpandedParameterId] = useState(null);

    const openParameterMenu = () => {
        setShowParameterMenu(true);
    }

    const addParameter = (id) => {
        props.setParameters([...props.parameters, props.parameterOptions.find((param) => param.id === id)]);
        setShowParameterMenu(false);
    };

    const removeParameter = (id) => {
        const updatedParameters = props.parameters.filter((p) => p.id !== id);
        props.setParameters(updatedParameters);
    };

    const openReformMenu = () => {
        setShowReformMenu(true);
    }
    
    const loadReform = (reform) => {
        props.setReform(reform);
        props.setParameters([...new Set(props.parameters.concat(reform.parameters).map(p => p.id))].map(id => props.parameterOptions.find(p => p.id === id)));
        setShowReformMenu(false);
    }      

    const editReform = () => {
        setTempReform(props.reform);
        setIsEditing(true);
    }

    const saveReform = () => {
        props.setReform(tempReform);
        setIsEditing(false);
    }

    const removeReform = () => {
        props.setReform(null);
    }

    const modifyTempReform = (obj) => {
        if (obj.name) {
            setTempReform({...tempReform, name: obj.name});
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
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px",
                    fontSize: "30px",
                }}
            >
                {!props.reform
                    ? showReformMenu
                        ? <ReformMenu
                            loadReform={loadReform}
                        />
                        : <AddButton
                            label={"Reform"}
                            add={openReformMenu}
                        />
                    : isEditing
                            ? <input
                                value={tempReform.name}
                                onChange={(e) => modifyTempReform({name: e.target.value})}
                                onKeyDown={(e) => {if (e.key === 'Enter') saveReform();}}
                                style={{
                                    width: "100%",
                                    color: "black",
                                }}
                            />
                            : <>
                                <b>{props.reform.name}</b>
                                <div>
                                    <ToggleEditSaveButton
                                        isEditing={isEditing}
                                        edit={editReform}
                                        save={saveReform} />
                                    <RemoveButton
                                        id={null}
                                        remove={removeReform} />
                                </div>
                            </>
                }
            </div>
            <table
                style={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderSpacing: "8px",
                    borderCollapse: "separate",
                }}
            >
            <thead>
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
            </thead>
            <tbody>
                {props.parameters.map((parameter) => {
                    const reformParameter = props.reform ? props.reform.parameters.find((p) => p.id === parameter.id) : null;
                    
                    return (<>
                        <ParameterRow
                            key={parameter.id}
                            isEditing={isEditing}
                            parameter={parameter}
                            reform={props.reform}
                            saveReform={saveReform}
                            tempReform={tempReform}
                            modifyTempReform={modifyTempReform}
                            reformValue={reformParameter ? reformParameter.reformValue : parameter.currentLawValue}
                            removeParameter={removeParameter}
                            onClick={() => {
                                parameter.id === expandedParameterId ? setExpandedParameterId(null) : setExpandedParameterId(parameter.id);
                            }}
                        />
                        {parameter.id === expandedParameterId
                            ? <ExplainerRow
                                parameter={parameter}
                                reform={props.reform}
                            />
                            : null
                        }
                    </>);
                })}
                {!showParameterMenu
                    ? <tr>
                        <td>
                            <AddButton
                                label={"Parameter"}
                                add={openParameterMenu}
                            />
                        </td>
                    </tr>
                    : <ParameterMenu 
                        parameters={props.parameters}
                        parameterOptions={props.parameterOptions}
                        addParameter={addParameter}
                        removeParameter={removeParameter}
                    />
                }
            </tbody>
            </table>
        </div>
    );
}