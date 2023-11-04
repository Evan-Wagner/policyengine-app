import {
    EditOutlined,
    SaveOutlined
} from "@ant-design/icons";

export default function ToggleEditSaveButton(props) {
    return (
        props.isEditing
            ?   <button onClick={() => props.save()}>
                    <SaveOutlined /> 
                </button>
            :
                <button onClick={() => props.edit()}>
                    <EditOutlined />
                </button>
    )
}