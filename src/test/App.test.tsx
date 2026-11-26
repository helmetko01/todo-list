import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('기본 화면이 정상 렌더링되고 빈 상태 안내가 표시된다', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '꼭 해야 할 일' })).toBeInTheDocument();
    expect(screen.getByText('작은 실천으로 채우는 하루')).toBeInTheDocument();
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '첫 할 일 입력하기' })).toBeInTheDocument();
  });

  it('할 일을 추가하고 목록에 정상 표시된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '추가' });

    await user.type(input, '첫 번째 리액트 공부');
    await user.click(addButton);

    expect(screen.getByText('첫 번째 리액트 공부')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('한글 IME 조합 중(isComposing: true) Enter 입력 시 추가되지 않는다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');

    fireEvent.change(input, { target: { value: '한글입력' } });
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: true } });

    // 제출되지 않아 입력창에 값이 그대로 남아있어야 함
    expect(input).toHaveValue('한글입력');
  });

  it('공백만 입력하고 추가를 누르면 에러 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addButton = screen.getByRole('button', { name: '추가' });
    await user.click(addButton);

    expect(screen.getByRole('alert')).toHaveTextContent('할 일을 입력해 주세요.');
  });

  it('할 일의 완료 상태를 체크박스로 전환한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '완료 테스트{enter}');

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText('전체 1개 중 1개 완료')).toBeInTheDocument();
  });

  it('할 일 내용을 수정하고 저장할 수 있다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '수정 전 텍스트{enter}');

    // 수정 버튼 클릭
    const editBtn = screen.getByTitle('수정');
    await user.click(editBtn);

    // 수정 입력창 확인
    const editInput = screen.getByDisplayValue('수정 전 텍스트');
    await user.clear(editInput);
    await user.type(editInput, '수정 후 텍스트');

    // 저장 버튼 클릭
    const saveBtn = screen.getByRole('button', { name: '수정 내용 저장' });
    await user.click(saveBtn);

    expect(screen.getByText('수정 후 텍스트')).toBeInTheDocument();
    expect(screen.queryByText('수정 전 텍스트')).not.toBeInTheDocument();
  });

  it('할 일을 삭제하면 실행 취소 토스트가 뜨고, 실행 취소 시 복원된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '삭제할 항목{enter}');

    expect(screen.getByText('삭제할 항목')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteBtn = screen.getByTitle('삭제');
    await user.click(deleteBtn);

    expect(screen.queryByText('삭제할 항목')).not.toBeInTheDocument();
    expect(screen.getByText('할 일을 삭제했어요.')).toBeInTheDocument();

    // 실행 취소 클릭
    const undoBtn = screen.getByRole('button', { name: /복원/ });
    await user.click(undoBtn);

    expect(screen.getByText('삭제할 항목')).toBeInTheDocument();
  });

  it('완료 항목 일괄 삭제 모달에서 취소 및 삭제가 정상 동작한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '할 일 1{enter}');
    await user.type(input, '할 일 2{enter}');

    // 최신 등록된 항목이 상단에 위치하므로 checkboxes[0]은 '할 일 2', checkboxes[1]은 '할 일 1'
    // '할 일 1'의 체크박스를 클릭하여 완료 처리
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const clearBtn = screen.getByRole('button', { name: /일괄 삭제/ });
    expect(clearBtn).not.toBeDisabled();

    // 일괄 삭제 클릭 -> 모달 오픈
    await user.click(clearBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('완료한 할 일 1개가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();

    // 취소 클릭
    const cancelBtn = screen.getByRole('button', { name: '취소' });
    await user.click(cancelBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('할 일 1')).toBeInTheDocument();

    // 다시 열고 삭제 확인
    await user.click(clearBtn);
    const confirmDeleteBtn = screen.getByRole('button', { name: '1개 삭제' });
    await user.click(confirmDeleteBtn);

    expect(screen.getByText('할 일 2')).toBeInTheDocument();
    expect(screen.queryByText('할 일 1')).not.toBeInTheDocument();
  });

  it('검색어로 목록을 필터링하고 검색어를 초기화할 수 있다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '장보기: 우유{enter}');
    await user.type(input, '책 읽기{enter}');

    const searchInput = screen.getByPlaceholderText('할 일 검색');
    await user.type(searchInput, '우유');

    expect(screen.getByText('장보기: 우유')).toBeInTheDocument();
    expect(screen.queryByText('책 읽기')).not.toBeInTheDocument();

    // 검색어 초기화 버튼
    const clearSearchBtn = screen.getByRole('button', { name: '검색어 초기화' });
    await user.click(clearSearchBtn);

    expect(screen.getByText('장보기: 우유')).toBeInTheDocument();
    expect(screen.getByText('책 읽기')).toBeInTheDocument();
  });

  it('필터가 "완료"일 때 새 할 일을 추가하면 숨겨짐 안내 배너가 표시된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 먼저 항목을 하나 추가하고 완료 상태로 변경
    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '완료된 일{enter}');
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // '완료' 필터 선택
    const completedFilterBtn = screen.getByRole('button', { name: '완료' });
    await user.click(completedFilterBtn);

    // 새 미완료 할 일 추가
    await user.type(input, '새로운 미완료 일{enter}');

    // 안내 배너 확인
    expect(screen.getByText(/할 일을 추가했어요\. 현재 조건에서는 보이지 않습니다\./)).toBeInTheDocument();
    const showAllBtn = screen.getByRole('button', { name: '전체 보기' });
    expect(showAllBtn).toBeInTheDocument();

    // '전체 보기' 클릭 시 두 항목 모두 보이고 배너 사라짐
    await user.click(showAllBtn);
    expect(screen.getByText('새로운 미완료 일')).toBeInTheDocument();
    expect(screen.getByText('완료된 일')).toBeInTheDocument();
    expect(screen.queryByText(/현재 조건에서는 보이지 않습니다/)).not.toBeInTheDocument();
  });

  it('빠른 연속 삭제 시 최신 1건만 실행 취소 대상이 된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '항목 1{enter}');
    await user.type(input, '항목 2{enter}');

    // 항목 2 삭제
    const deleteButtons = screen.getAllByTitle('삭제');
    await user.click(deleteButtons[0]);

    // 항목 1 삭제
    const nextDeleteBtn = screen.getByTitle('삭제');
    await user.click(nextDeleteBtn);

    // 실행 취소 토스트의 대상 라벨 확인 (항목 1이 대상)
    const undoBtn = screen.getByRole('button', { name: /'항목 1' 복원/ });
    expect(undoBtn).toBeInTheDocument();

    await user.click(undoBtn);
    expect(screen.getByText('항목 1')).toBeInTheDocument();
    expect(screen.queryByText('항목 2')).not.toBeInTheDocument();
  });
});
