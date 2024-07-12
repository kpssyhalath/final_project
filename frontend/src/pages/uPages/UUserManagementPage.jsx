
import React from "react";
import { Typography, Card, Divider, Button, Modal } from "antd";
import EnhancedTable from "@/components/data-table/uUserManagementTable";
import UDashboardLayout from "@/layouts/UDashboardLayout";

export default function UUserManagementPage() {
  return (
    <UDashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              User Management
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
          <div style={{ marginTop: "0px" }}>
            <EnhancedTable />
          </div>
        </Card>
      </>
    </UDashboardLayout>
  );
}
