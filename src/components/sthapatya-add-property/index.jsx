import React, { useEffect, useState } from "react";
import DashBoardContainer from "../layout/dashboard-container";
import { Form, FormikProvider, useFormik } from "formik";
import { CircularProgress, Grid, Paper } from "@mui/material";
import { useSelector } from "react-redux";
import useApiState from "../common/useApiState";
import AlertMsg from "../common/alert";
import FormTitle from "../form-fields/form-title";
import { labels } from "../../lang/labels";
import { FormLabel, FormValue, GridRow } from "../common/custom-form-grid";
import SelectInput from "../form-fields/select-input";
import { getErrorMsg } from "../../utils/helpers";
import { showToastError, showToastSuccess } from "../common/toastHelper";
import {
  getZoneByProfile,
  addsthapatyaProperty,
} from "../../services/assessment-services";
import FormButtons from "../common/buttons";

const SthapatyaAddProperty = () => {
  const lang = useSelector((state) => state.userDetails.lang);
  const { loading, setLoading, error, setError } = useApiState();
  const [zoneKeys, setZoneKeys] = useState([]);

  const formik = useFormik({
    initialValues: { zoneKey: "" },
    onSubmit: () => {},
  });

  // Load zone dropdown
  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true);
        const zonesRes = await getZoneByProfile();
        setZoneKeys(zonesRes.zoneLst);
        if (zonesRes.zoneLst.length === 1) {
          formik.setFieldValue("zoneKey", zonesRes.zoneLst[0].value);
        }
      } catch (error) {
        showToastError(getErrorMsg(error));
      } finally {
        setLoading(false);
      }
    };
    loadZones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show button click
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Find the selected zone option to get its name
      const selectedZone = zoneKeys.find(
        (z) => z.value === formik.values.zoneKey,
      );
      const zone = selectedZone?.label;

      const res = await addsthapatyaProperty({ zone });
      showToastSuccess(res?.message || JSON.stringify(res));
    } catch (error) {
      showToastError(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashBoardContainer>
      {error && (
        <AlertMsg
          message={error}
          severity="error"
          onClose={() => setError("")}
        />
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ marginTop: "65px" }} />
        </div>
      ) : (
        <Grid>
          <FormikProvider value={formik}>
            <Form>
              <Paper elevation={4} sx={{ marginBottom: "15px" }}>
                <FormTitle title="Sthapatya Add Property" />
                <GridRow>
                  <FormLabel label={labels.Zone[lang]} />
                  <FormValue
                    component={
                      <SelectInput name="zoneKey" options={zoneKeys} />
                    }
                  />
                </GridRow>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid
                    item
                    md={3}
                    container
                    justifyContent={{ md: "flex-end" }}
                    alignItems="center"
                    p={2}
                  >
                    <FormButtons
                      isValid={!formik.values.zoneKey}
                      handleSubmitButtonClick={handleSubmit}
                      resetForm={() => formik.resetForm()}
                      submitBtnLabel="Show"
                      isSubmitIcon={false}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Form>
          </FormikProvider>
        </Grid>
      )}
    </DashBoardContainer>
  );
};

export default React.memo(SthapatyaAddProperty);
