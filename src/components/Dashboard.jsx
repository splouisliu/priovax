import { DataGrid } from "@material-ui/data-grid";

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../contexts/StoreContext";
import { useCloud } from "../contexts/CloudContext";
import { Link, useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CsvModal from "./CsvModal";
import PatientModal from "./PatientModal";
import axios from "axios";

const columns = [
  { field: "id", headerName: "#", width: 70 },
  { field: "probability", headerName: "Priority", width: 130 },
  { field: "first_name", headerName: "First name", width: 130 },
  { field: "last_name", headerName: "Last name", width: 130 },
  { field: "phone_number", headerName: "Phone number", width: 200 },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 90,
  },
  { field: "gender_binary", headerName: "Gender", width: 130 },
  { field: "blood", headerName: "Blood", width: 130 },
  { field: "cancer", headerName: "Cancer", width: 130 },
  { field: "cardiacs", headerName: "Cardiacs", width: 130 },
  { field: "diabetes", headerName: "Diabetes", width: 130 },
  { field: "hypertension", headerName: "Hypertension", width: 130 },
  { field: "kidney", headerName: "Kidney", width: 130 },
  { field: "neuro", headerName: "Neuro", width: 130 },
  { field: "ortho", headerName: "Ortho", width: 130 },
  { field: "prostate", headerName: "Prostate", width: 130 },
  { field: "respiratory", headerName: "Respiratory", width: 130 },
  { field: "thyroid", headerName: "Thyroid", width: 130 },
];

export default function DataTable() {
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const { getPatients } = useStore();
  const { notifyPatients } = useCloud();

  const [rows, setRows] = useState([]);
  //const [columns, setColumns] = useState([]);

  useEffect(() => {
    getPatients().onSnapshot(querySnapshot => {
      const temp = querySnapshot.docs.map((doc, index) => {
        return { id: index + 1, ...doc.data() };
      });
      setRows(temp);
    });
  }, []);

  const compare = (a, b) => {
    if (a.prioritzation > b.prioritzation) {
    }
    if (a.prioritzation < b.prioritzation) {
      return -1;
    }
    if (a.prioritzation > b.prioritzation) {
      return 1;
    }
    // a must be equal to b
    return 0;
  };

  const handleVonage = () => {
    rows.sort(compare).forEach((patient, index) => {
      console.log(patient.phone_number);

      let day = new Date();
      day.setDate(day.getDate() + index);

      patient.phone_number &&
        notifyPatients(patient.phone_number, day)
          .then(result => {
            console.log(result);
          })
          .catch(err => console.log(err));
    });
  };

  axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
  axios.defaults.headers.post["Content-Type"] = "application/json";

  const handleML = () => {
    axios
      .post("https://us-central1-priovax.cloudfunctions.net/predictionModel", {
        clinic_id: currentUser.uid,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <>
      <div style={{ height: "70vh", width: "100%" }}>
        <DataGrid rows={rows} columns={columns} pageSize={25} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div className=" d-flex align-items-center mt-2">
          <PatientModal></PatientModal>
          <CsvModal></CsvModal>
        </div>
        <div className=" d-flex align-items-center mt-2">
          <Button
            variant="contained"
            color="secondary"
            className="mr-2"
            onClick={handleML}
          >
            Prioritize
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleVonage}>
            Notify All Patients
          </Button>
        </div>
      </div>
    </>
  );
}
