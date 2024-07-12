import React, { useState, useEffect } from "react";
import UDashboardLayout from "@/layouts/UDashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { Divider, Button, Modal, Card, Typography } from "antd";
// import Linecharts from "@/components/charts/line-charts/Linecharts";
// import EnhancedTable from "@/components/data-table/RcampaingsTable";
import EnhancedTable from "@/components/data-table/uRcampaignsTable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import EmailSentDonut from "@/components/charts/donut-charts/emailSentDonut";
import EmailOpenDonut from "@/components/charts/donut-charts/emailOpenDonut";
import ClickedLinkDonut from "@/components/charts/donut-charts/ClickedLinkDonut";
import SummittedDataDonut from "@/components/charts/donut-charts/SummittedDataDonut";
import axios from "../../middleware/axios";


export default function URCampaignsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [isFinish, setIsFinished] = useState("");

  const [target, setTarget] = useState([]);
  const [cam_name, setCamName] = useState("");
  const navigate = useNavigate();

  const handlecampaignsClick = () => {
    navigate("/u/campaigns");
  };
  const { cam_id } = useParams();

  if (isNaN(cam_id)) {
    navigate("/*");
  }
  const [total, setTotal] = useState();
  const [emailsent, setEmailsent] = useState();
  const [emailopened, setEmailopened] = useState();
  const [clickedlink, setClickedlink] = useState();
  const [summitdata, setSummitdata] = useState();

  const showModalFinish = () => {
    setIsModalOpenFinish(true);
  };

  const handleCancel = () => {
    setIsModalOpenDelete(false);
    setIsModalOpenFinish(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    navigate(`/u/refresh`);

    setTimeout(() => {
      navigate(`/u/campaigns/result/${cam_id}`);

      setRefreshing(false);
    });
  };

  // const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  useEffect(() => {
    getDataTargetResult();
  }, []);

  const getDataTargetResult = async () => {
    setTarget([]);
    try {
      const response = await axios.get(`result/${cam_id}`, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      const data = response.data;
      const user = data.camData[0].user_belong;

      if (
        data.camData[0].modified_date != null &&
        data.camData[0].modified_date !== ""
      ) {
        setIsFinished("- (Finished Campaign)");
      } else {
        setIsFinished("");
      }
      const target_list = data.targetData.map((target) => ({
        id: target.Amount,
        firstname: target.Firstname,
        lastname: target.Lastname,
        email: target.Email,
        sent: target.Error != "✗" ? "✓" : "✗",
        open_email: target["Open email"],
        click_link: target["Click link"],
        submit_data: target["Submit data"],
      }));

      setTarget(target_list);

      const cam_Data = data.camData[0];

      setCamName(cam_Data.cam_name);

      setTotal(cam_Data.status.total);
      setEmailsent(cam_Data.status.send_mail);
      setEmailopened(cam_Data.status.open);
      setClickedlink(cam_Data.status.click);
      setSummitdata(cam_Data.status.submit);
      console.log(summitdata);
    } catch (error) {
      if (error.response.status === 404) {
        console.log(error.response.data.msg);
        navigate("/campaigns");
      } else if (error.response.status === 403) {
        console.log(error.response.data.msg);
        navigate("/unauthorized");
      }
    }
  };

  //Download Campaign File XLSX
  const handleExportXLSX = async () => {
    try {
      const response = await axios.get(`result/download/${cam_id}`, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
        responseType: "blob",
      });
      if (response) {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cam_name}_result.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log("ExportXLSX successful!");
      }
    } catch (error) {
      console.error("Error ExportXLSX:", error);
      console.log(error);
    }
  };

  // //Finish Campaign
  // const handleFinish = async () => {
  //   try {
  //     const response = await axiosPrivate.get(
  //       `finish_campaign/${cam_id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${JSON.parse(access_token)}`,
  //         },
  //       }
  //     );
  //     if (response) {
  //       console.log("Set Finish Campaign successful!");
  //       setIsFinished("- (Finished Campaign)");

  //       getDataTargetResult();
  //       showModalFinish(false);
  //     }
  //   } catch (error) {
  //     console.error("Error Set Finish Campaign:", error);
  //     console.log(error);
  //   }
  // };

  return (
    <>
      <UDashboardLayout>
        <Card
          title={
            <Typography.Title level={1}>
              Results of Campaign
              <Divider style={{ marginBottom: "0px" }} />
            </Typography.Title>
          }
          bordered={false}
          style={{
            width: "100%",
            borderBottom: "0 2px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              icon={<ArrowBackIcon fontSize="small" />}
              style={{
                fontSize: "14px",
                width: 100,
                height: 40,
                backgroundColor: "#bebebe",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handlecampaignsClick}
            >
              BACK
            </Button>
            <Button
              icon={<AssessmentIcon fontSize="small" />}
              style={{
                fontSize: "14px",
                width: 170,
                height: 40,
                backgroundColor: "#236cfe",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleExportXLSX}
            >
              Export As XLSX
            </Button>
            <Button
              icon={<AutorenewIcon fontSize="small" />}
              style={{
                fontSize: "14px",
                width: 130,
                height: 40,
                backgroundColor: "#7fa0fb",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          <Divider style={{ marginBottom: "0px" }} />

          <Typography.Title level={1}>
            {`${cam_name} ${isFinish}`}
            <Divider style={{ marginBottom: "0px" }} />
          </Typography.Title>
          {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Linecharts />
          </div> */}
          <div className="dashboard-container">
            <EmailSentDonut total={total} emailsent={emailsent} />
            <EmailOpenDonut total={total} emailopened={emailopened} />
            <ClickedLinkDonut total={total} clickedlink={clickedlink} />
            <SummittedDataDonut total={total} submitted={summitdata} />
          </div>
          <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <Typography.Title level={1}>Details</Typography.Title>
          </div>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable data={target || []} />
          </div>
        </Card>
      </UDashboardLayout>
    </>
  );
}