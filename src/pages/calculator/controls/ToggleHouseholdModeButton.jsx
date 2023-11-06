import {
  GlobalOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { Button } from "antd";

export default function ToggleHouseholdModeButton(props) {
  return (
    <Button style={props.style || {width: "36px", padding: "0px"}} onClick={props.toggle}>
      {props.isInHouseholdMode
        ? <HomeOutlined /> 
        : <GlobalOutlined />
      }
    </Button>
  );
}