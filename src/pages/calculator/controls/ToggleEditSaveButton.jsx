import {
    EditOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { Button } from "antd";

export default function ToggleEditSaveButton(props) {
    return (
        props.isEditing
            ?   <Button style={props.style || {width: "36px", padding: "0px"}} onClick={() => props.save()}>
                    <SaveOutlined /> 
                </Button>
            :
                <Button style={props.style || {width: "36px", padding: "0px"}} onClick={() => props.edit()}>
                    <EditOutlined />
                </Button>
    )
}