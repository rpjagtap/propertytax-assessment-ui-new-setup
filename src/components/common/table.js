import { Checkbox, TableCell, TableHead, TableRow } from "@mui/material"

export const RenderTableHead = ({
    thSx, trSx, cells, isSelectAll, handleSelectAll
}) => {

    return (
        <TableHead sx={thSx}>
            <TableRow
                sx={trSx}
            >
                {cells.map((item, index) => {
                    return (<TableCell align="center" key={index}>
                        {/* {item} */}
                        {(item === 'Action') ? <Checkbox
                            sx={{
                                padding: "0px",
                            }}
                            checked={isSelectAll}
                            onChange={handleSelectAll}
                        /> : item}
                    </TableCell>)
                })}
            </TableRow>
        </TableHead>
    )
}