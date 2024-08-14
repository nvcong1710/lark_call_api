import { isClickableInput } from "@testing-library/user-event/dist/utils";
import { useEffect, useState } from "react";

function Home() {
    const [listTasks, setListTasks] = useState([{
        "fields": {
            "Date": 0,
            "Person": [

            ],
            "Single Option": "",
            "Task": "",
            "id": ""
        }
    }]);

    const fetchRecord = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/records', {
                method: 'GET'
            });
            const data = await response.json();
            setListTasks(data.data.items);
        } catch (error) {
            console.error("Error fetching records:", error);
        }
    };

    const deleteRecord = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/api/records/delete/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('Record deleted successfully');
            } else {
                console.error('Failed to delete record');
            }
            fetchRecord();
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };


    useEffect(() => {
        fetchRecord();
    }, []);

    return (<>
        <div>
            <h1>Task List</h1>
            <a href="/Create">Thêm mới</a>

            {listTasks ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Task</th>
                            <th>Date</th>
                            <th>Single Option</th>
                            <th>Person Name</th>
                            <th>Person Email</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listTasks.map((task) => (
                            task.fields.Person && task.fields.Person.length > 0 ? (
                                task.fields.Person.map((person, index) => (
                                    <tr key={`${task.id}-${index}`}>
                                        {index === 0 ? (
                                            <>
                                                <td rowSpan={task.fields.Person.length}>
                                                    {task.id}
                                                </td>
                                                <td rowSpan={task.fields.Person.length}>
                                                    {task.fields.Task}
                                                </td>
                                                <td rowSpan={task.fields.Person.length}>
                                                    {new Date(task.fields.Date).toISOString().split('T')[0]}
                                                </td>
                                                <td rowSpan={task.fields.Person.length}>
                                                    {task.fields["Single Option"]}
                                                </td>
                                            </>
                                        ) : null}
                                        <td>{person.name || ''}</td>
                                        <td>{person.email || ''}</td>
                                        <td>
                                            <button onClick={() => { deleteRecord(task.id) }}>Xoá</button>
                                        </td>
                                        <td>
                                            <a href={`/Update/${task.id}`}>Sửa</a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key={task.id}>
                                    <td>{task.id}</td>
                                    <td>{task.fields.Task}</td>
                                    <td>{new Date(task.fields.Date).toISOString().split('T')[0]}</td>
                                    <td>{task.fields["Single Option"]}</td>
                                    <td>____</td>
                                    <td>____</td>
                                    <td>
                                        <button onClick={() => { deleteRecord(task.id) }}>Xoá</button>
                                    </td>
                                    <td>
                                        <a href={`/Update/${task.id}`}>Sửa</a>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>

                </table>
            ) : (
                <p>Loading...</p>
            )}

        </div>
    </>);
}

export default Home;