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

const ParameterMenu = (props) => {
    return (<>
        {props.parameterOptions
            .filter(option => !props.parameters.some(param => param.id === option.id))
            .map((parameter, index) => (
                <tr key={index} 
                    style={{
                    cursor: 'pointer',
                    }}
                    onClick={() => props.addParameter(parameter.id)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#fff0db'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                <td style={{backgroundColor: "white",}}>{parameter.name}</td>
                <td style={{backgroundColor: "white",}}>{parameter.currentLawValue}</td>
                </tr>
            ))
        }
    </>);
}

const ParameterRow = (props) => {
    const [tempReformValue, setTempReformValue] = useState(null);

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
        <tr key={props.parameter.id}>
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
        {!props.reform
            ? null
            : <td
                style={{
                    padding: "5px",
                    backgroundColor: "#fff0db",
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
        <td>
            <RemoveButton
                id={props.parameter.id}
                remove={props.removeParameter}
            />
        </td>
        </tr>
    );
}

export default function PolicyTable(props) {
    const [showParameterMenu, setShowParameterMenu] = useState(false);
    const [showReformMenu, setShowReformMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempReform, setTempReform] = useState(props.reform);

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
            {!props.reform ? <>
                <th>
                {showReformMenu ?
                <ReformMenu
                    loadReform={loadReform}
                /> :
                <AddButton
                    label={"Reform"}
                    add={openReformMenu}
                />}
                </th>
            </> : <>
                <th
                style={{
                    padding: "5px",
                    color: "white",
                    backgroundColor: style.colors.TEAL_ACCENT,
                }}
                >
                {isEditing ? 
                    <input
                    value={tempReform.name}
                    onChange={(e) => modifyTempReform({name: e.target.value})}
                    onKeyDown={(e) => {if (e.key === 'Enter') saveReform();}}
                    style={{
                        width: "100%",
                        color: "black",
                    }}
                    /> :
                    <b>{props.reform.name}</b>
                }
                <ToggleEditSaveButton
                    isEditing={isEditing}
                    edit={editReform}
                    save={saveReform}
                />
                </th>
                <th style={{width: "36px",}}>
                <RemoveButton
                    id={null}
                    remove={removeReform}
                />
                </th>
            </>}
            </tr>
        </thead>
        <tbody>
            {props.parameters.map((parameter) => {
            const reformParameter = props.reform ? props.reform.parameters.find((p) => p.id === parameter.id) : null;
            
            return (
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
                />
            );
            })}
            {!showParameterMenu ?
            <tr>
                <td>
                    <AddButton
                        label={"Parameter"}
                        add={openParameterMenu}
                    />
                </td>
            </tr> : 
            <ParameterMenu 
                addParameter={addParameter} 
                parameters={props.parameters}
                parameterOptions={props.parameterOptions}
            />
            }
        </tbody>
        </table>
    );
}