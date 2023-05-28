
const Filter = ({filter_str, handle}) => {
    return (
        <form>
        <div>
          filter shown with <input
          value={filter_str}
          onChange={handle}
          />
        </div>
      </form>
    )
}

export default Filter